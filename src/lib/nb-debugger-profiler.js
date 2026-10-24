const REPORT_INTERVAL = 100;

const createWorkerSource = sampleInterval => `
const sleep = new Int32Array(new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT));
onmessage = event => {
    const pc = event.data.pc;
    let times = Object.create(null);
    let previous = performance.now();
    let lastReport = previous;
    while (true) {
        Atomics.wait(sleep, 0, 0, ${sampleInterval});
        const location = Atomics.load(pc, 0);
        const now = performance.now();
        times[location] = (times[location] || 0) + now - previous;
        previous = now;
        if (now - lastReport >= ${REPORT_INTERVAL}) {
            postMessage(times);
            times = Object.create(null);
            lastReport = now;
        }
    }
};`;

class NBDebuggerProfiler {
    constructor (vm, onUpdate) {
        this.vm = vm;
        this.onUpdate = onUpdate;
        this.rows = Object.create(null);
        this.enabled = false;
        this.worker = null;
        this.workerUrl = null;
        this.interpreter = null;
        this.previousSamplerLevel = 0;
        this.lastUpdate = 0;
        this.reportingEnabled = true;
        this.sampleInterval = 0.5;
        this.error = null;
    }

    isSamplingAvailable () {
        const Sampler = this.vm.exports && this.vm.exports.Sampler;
        return Boolean(Sampler && this.vm.runtime.sampler && this.vm.runtime.sampler.isAvailable() &&
            typeof Worker === 'function');
    }

    start () {
        if (this.enabled) return true;
        this.error = null;
        this.enabled = true;
        try {
            if (this.vm.runtime.compilerOptions.enabled) {
                if (!this.isSamplingAvailable()) {
                    throw new Error('Compiled profiling requires SharedArrayBuffer and Worker support.');
                }
                this._startSampler();
            } else {
                this._startInterpreter();
            }
        } catch (error) {
            this.enabled = false;
            this.error = error;
            return false;
        }
        return true;
    }

    getErrorMessage () {
        return this.error ? this.error.message : '';
    }

    setReportingEnabled (enabled) {
        this.reportingEnabled = enabled;
        if (enabled && this.enabled) this._update(true);
    }

    setSampleInterval (sampleInterval) {
        if (!Number.isFinite(sampleInterval) || sampleInterval < 0.1 || sampleInterval > 2) return false;
        this.sampleInterval = sampleInterval;
        if (!this.worker) return true;
        this.worker.terminate();
        this.worker = null;
        if (this.workerUrl) URL.revokeObjectURL(this.workerUrl);
        this.workerUrl = null;
        try {
            this._startSamplerWorker(this.vm.runtime.sampler);
            this.error = null;
            return true;
        } catch (error) {
            this.error = error;
            this.enabled = false;
            this.vm.runtime.sampler.setEnabled(this.previousSamplerLevel);
            this.onUpdate(this.getRows(), error);
            return false;
        }
    }

    stop () {
        if (!this.enabled && !this.worker && !this.interpreter) return;
        this.enabled = false;
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
            this.vm.runtime.sampler.setEnabled(this.previousSamplerLevel);
        }
        if (this.interpreter) {
            const {sequencer, originalStepThread, originalProfilerDescriptor, patchedThreads} = this.interpreter;
            sequencer.stepThread = originalStepThread;
            for (const {thread, descriptor} of patchedThreads) {
                if (descriptor) Object.defineProperty(thread, 'blockGlowInFrame', descriptor);
                else delete thread.blockGlowInFrame;
            }
            if (originalProfilerDescriptor) {
                Object.defineProperty(this.vm.runtime, 'profiler', originalProfilerDescriptor);
            } else {
                delete this.vm.runtime.profiler;
            }
            this.interpreter = null;
        }
    }

    clear () {
        this.rows = Object.create(null);
        if (this.interpreter) {
            this.interpreter.active = false;
            this.interpreter.blockId = null;
            this.interpreter.targetId = null;
            this.interpreter.startTime = 0;
        }
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
            const Sampler = this.vm.exports && this.vm.exports.Sampler;
            if (Sampler && this.vm.runtime.sampler.pc) {
                this.vm.runtime.sampler.pc[0] = Sampler.IDLE;
            }
            try {
                this._startSamplerWorker(this.vm.runtime.sampler);
            } catch (error) {
                this.error = error;
                this.enabled = false;
                this.vm.runtime.sampler.setEnabled(this.previousSamplerLevel);
                this.onUpdate(this.getRows(), error);
                return;
            }
        }
        this._update(true);
    }

    dispose () {
        this.stop();
        if (this.workerUrl) URL.revokeObjectURL(this.workerUrl);
        this.workerUrl = null;
    }

    getRows () {
        return Object.keys(this.rows).map(key => this.rows[key]);
    }

    _addTime (key, time, targetId, blockId, label, calls) {
        let row = this.rows[key];
        if (!row) {
            row = this.rows[key] = {
                key,
                label: label || '',
                targetId: targetId || null,
                blockId: blockId || null,
                totalTime: 0,
                callCount: 0
            };
        }
        row.totalTime += time;
        row.callCount += calls || 0;
    }

    _update (force) {
        if (!this.reportingEnabled) return;
        const now = performance.now();
        if (!force && now - this.lastUpdate < REPORT_INTERVAL) return;
        this.lastUpdate = now;
        this.onUpdate(this.getRows());
    }

    _startSampler () {
        const Sampler = this.vm.exports.Sampler;
        const sampler = this.vm.runtime.sampler;
        this.previousSamplerLevel = sampler.enableCommands ? Sampler.LEVEL_COMMANDS :
            (sampler.enableBasic ? Sampler.LEVEL_BASIC : 0);
        sampler.setEnabled(Sampler.LEVEL_COMMANDS);
        try {
            this._startSamplerWorker(sampler);
        } catch (error) {
            sampler.setEnabled(this.previousSamplerLevel);
            throw error;
        }
    }

    _startSamplerWorker (sampler) {
        const Sampler = this.vm.exports.Sampler;
        if (!this.workerUrl) {
            const source = createWorkerSource(this.sampleInterval);
            this.workerUrl = URL.createObjectURL(new Blob([source], {type: 'text/javascript'}));
        }
        const worker = new Worker(this.workerUrl);
        this.worker = worker;
        worker.onerror = event => {
            if (this.worker !== worker) return;
            const error = new Error(event.message || 'The profiling worker stopped unexpectedly.');
            this.error = error;
            this.stop();
            this.onUpdate(this.getRows(), error);
        };
        worker.onmessage = event => {
            if (!this.enabled || this.worker !== worker) return;
            for (const locationText of Object.keys(event.data)) {
                const location = Number(locationText);
                const time = event.data[locationText];
                if (location >= 0) {
                    const block = sampler.locationToBlock(location);
                    if (block) this._addTime(`sample:${location}`, time, block.spriteId, block.blockId, '', 0);
                } else {
                    let label = 'Runtime';
                    if (location === Sampler.RENDERER) label = 'Renderer';
                    else if (location === Sampler.WARP_TIMER) label = 'Warp timer';
                    else if (location === Sampler.IDLE) continue;
                    this._addTime(`sample:${location}`, time, null, null, label, 0);
                }
            }
            this._update(false);
        };
        worker.postMessage({pc: sampler.pc});
    }

    _startInterpreter () {
        const sequencer = this.vm.runtime.sequencer;
        const originalStepThread = sequencer.stepThread;
        const profiler = this;
        const originalProfilerDescriptor = Object.getOwnPropertyDescriptor(this.vm.runtime, 'profiler');
        const state = {
            sequencer,
            originalStepThread,
            originalProfilerDescriptor,
            active: false,
            thread: null,
            blockId: null,
            targetId: null,
            startTime: 0,
            patchedThreads: []
        };
        const finishBlock = now => {
            if (!state.blockId) return;
            profiler._addTime(
                `interpret:${state.targetId}:${state.blockId}`,
                now - state.startTime,
                state.targetId,
                state.blockId,
                '',
                1
            );
            profiler._update(false);
            state.blockId = null;
        };
        const profile = () => {
            state.active = false;
            const blockId = state.thread && state.thread.peekStack();
            if (!blockId || state.thread.updateMonitor) return;
            const now = performance.now();
            finishBlock(now);
            const target = state.thread.target;
            const original = target.sprite && target.sprite.clones && target.sprite.clones[0];
            state.blockId = blockId;
            state.targetId = original ? original.id : target.id;
            state.startTime = now;
        };
        Object.defineProperty(this.vm.runtime, 'profiler', {
            get () {
                if (state.active) profile();
                return null;
            },
            configurable: true
        });
        sequencer.stepThread = function (...args) {
            state.thread = this.activeThread;
            if (state.thread) {
                const descriptor = Object.getOwnPropertyDescriptor(state.thread, 'blockGlowInFrame');
                if (!descriptor || typeof descriptor.set !== 'function' || !descriptor.set.profilerPatched) {
                    if (state.patchedThreads.length > profiler.vm.runtime.threads.length + 10) {
                        state.patchedThreads = state.patchedThreads.filter(entry =>
                            profiler.vm.runtime.threads.indexOf(entry.thread) !== -1
                        );
                    }
                    let blockGlowInFrame = descriptor && descriptor.value;
                    const setter = value => {
                        state.active = true;
                        blockGlowInFrame = value;
                    };
                    setter.profilerPatched = true;
                    state.patchedThreads.push({thread: state.thread, descriptor});
                    Object.defineProperty(state.thread, 'blockGlowInFrame', {
                        get: () => blockGlowInFrame,
                        set: setter,
                        configurable: true
                    });
                }
            }
            state.active = true;
            try {
                return originalStepThread.apply(this, args);
            } finally {
                state.active = false;
                finishBlock(performance.now());
            }
        };
        this.interpreter = state;
    }
}

export default NBDebuggerProfiler;
