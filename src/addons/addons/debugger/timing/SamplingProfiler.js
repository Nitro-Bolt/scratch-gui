// How long the worker sleeps between samples, in milliseconds.
const SAMPLE_INTERVAL = 0.1;
// How often the worker sends its accumulated samples to the main thread, in milliseconds.
const REPORT_INTERVAL = 100;

// Runs in a worker. Every iteration it reads the location that the VM is currently executing and
// attributes the time elapsed since the previous sample to it.
const workerSource = `
const SAMPLE_INTERVAL = ${SAMPLE_INTERVAL};
const REPORT_INTERVAL = ${REPORT_INTERVAL};
onmessage = (e) => {
  const pc = e.data.pc;
  const sleep = new Int32Array(new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT));
  let times = new Map();
  let last = performance.now();
  let lastReport = last;
  while (true) {
    Atomics.wait(sleep, 0, 0, SAMPLE_INTERVAL);
    const location = Atomics.load(pc, 0);
    const now = performance.now();
    times.set(location, (times.get(location) || 0) + now - last);
    last = now;
    if (now - lastReport >= REPORT_INTERVAL) {
      postMessage(times);
      times = new Map();
      lastReport = now;
    }
  }
};
`;

// Profiles compiled threads using the VM's sampler.
class SamplingProfiler {
  constructor(vm, msg) {
    this.vm = vm;
    this.isProfiling = false;
    this.tm = null;
    this.worker = null;
    this.workerURL = null;

    const Sampler = vm.exports.Sampler;
    this.Sampler = Sampler;
    this.reservedLabels = Sampler
      ? new Map([
          [Sampler.RUNTIME, msg("timing-runtime")],
          [Sampler.RENDERER, msg("timing-renderer")],
          [Sampler.WARP_TIMER, msg("timing-warp-timer")],
        ])
      : new Map();
  }

  isAvailable() {
    return !!this.Sampler && this.vm.runtime.sampler.isAvailable();
  }

  start() {
    if (this.isProfiling) return;
    this.isProfiling = true;

    const sampler = this.vm.runtime.sampler;
    sampler.setEnabled(this.Sampler.LEVEL_COMMANDS);

    if (!this.workerURL) {
      this.workerURL = URL.createObjectURL(new Blob([workerSource], { type: "text/javascript" }));
    }
    this.worker = new Worker(this.workerURL);
    this.worker.onmessage = (e) => this.handleSamples(e.data);
    this.worker.postMessage({ pc: sampler.pc });
  }

  stop() {
    if (!this.isProfiling) return;
    this.isProfiling = false;

    this.worker.terminate();
    this.worker = null;
    this.vm.runtime.sampler.setEnabled(0);
  }

  handleSamples(times) {
    if (!this.isProfiling) return;

    const sampler = this.vm.runtime.sampler;
    for (const [location, time] of times) {
      if (location >= 0) {
        const { spriteId, blockId } = sampler.locationToBlock(location);
        this.tm.addProfileTime(`profile:${location}`, time, spriteId, blockId);
      } else if (this.reservedLabels.has(location)) {
        this.tm.addProfileTime(`profile:${location}`, time, null, null, this.reservedLabels.get(location));
      }
    }
  }
}

export default SamplingProfiler;
