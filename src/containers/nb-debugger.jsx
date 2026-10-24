import React from 'react';
import VM from 'scratch-vm';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import bindAll from 'lodash.bindall';
import DebuggerComponent from '../components/nb-debugger/debugger.jsx';
import NBDebuggerProfiler from '../lib/nb-debugger-profiler';

import {
    closeDebugger,
    dragDebugger,
    startDrag,
    endDrag,
    setTab,
    setPerformanceChart,
    clearLogs
} from '../reducers/debugger';
import {activateTab, BLOCKS_TAB_INDEX} from '../reducers/editor-tab.js';
import {openInspectThreadModal} from '../reducers/modals.js';

/**
 * Helper class to flash a Blockly scratch block chain in the users workspace
 */
class ThreadFlasher {
    /**
     * Flash a block chain and restore its exact colors afterward.
     * @param {object} block Blockly block to flash
     * @param {Function} onComplete callback after the original colors are restored
     */
    static flash (block, onComplete) {
        ThreadFlasher.stop();
        ThreadFlasher.entries = block.getDescendants().map(descendant => ({
            block: descendant,
            colours: [
                descendant.getColour(),
                descendant.getColourSecondary(),
                descendant.getColourTertiary(),
                descendant.getColourQuaternary()
            ]
        }));
        let count = 4;
        let flashOn = true;
        const update = () => {
            for (const entry of ThreadFlasher.entries) {
                if (!entry.block.workspace) continue;
                if (flashOn) entry.block.setColour('#ffff80', '#ffff80', '#ffff80', '#ffff80');
                else entry.block.setColour(...entry.colours);
            }
            flashOn = !flashOn;
            count--;
            if (count > 0) {
                ThreadFlasher.timerId = setTimeout(update, 200);
            } else {
                ThreadFlasher.timerId = null;
                ThreadFlasher.entries = [];
                if (onComplete) onComplete();
            }
        };
        update();
    }

    /** Restore colors immediately and cancel any active flash. */
    static stop () {
        if (ThreadFlasher.timerId !== null) clearTimeout(ThreadFlasher.timerId);
        for (const entry of ThreadFlasher.entries) {
            if (entry.block.workspace) entry.block.setColour(...entry.colours);
        }
        ThreadFlasher.timerId = null;
        ThreadFlasher.entries = [];
    }
}

ThreadFlasher.entries = [];
ThreadFlasher.timerId = null;

class NBDebugger extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleCloseCompilerWarning',
            'handleClearTiming',
            'handleCompilerOptionsChanged',
            'handleDisableCompiler',
            'handleProjectLoaded',
            'handleProjectStart',
            'handleRuntimeStep',
            'handleSelectTarget',
            'handleSelectTargetBlock',
            'handleSelectTimingRow',
            'handleSetAutoStopTimers',
            'handleSetHeatmap',
            'handleSetHeatmapScale',
            'handleSetProfiling',
            'handleSetSampleInterval',
            'handleTimingUpdate',
            'handleWorkspaceUpdate'
        ]);

        this.stepCount = 0;
        this.lastSampleTime = performance.now() + 3000;
        this.fpsData = new Array(20).fill(0);
        this.cloneData = new Array(20).fill(0);
        this.memoryData = new Array(20).fill(0);

        this.coloredBlocks = Object.create(null);
        this.profileLabels = Object.create(null);
        this.heatmapRefreshTimer = null;
        this.profiler = new NBDebuggerProfiler(props.vm, this.handleTimingUpdate);
        this.profiler.setReportingEnabled(props.tab === 3);
        this.state = {
            closedCompilerWarning: true,
            fpsData: this.fpsData.slice(),
            cloneData: this.cloneData.slice(),
            memoryData: this.memoryData.slice(),
            threads: [],
            profileRows: [],
            profiling: false,
            profilingAvailable: !props.vm.runtime.compilerOptions.enabled || this.profiler.isSamplingAvailable(),
            profilingError: '',
            restartRequired: false,
            autoStopTimers: Boolean(props.vm.runtime.debuggerAutoStopTimers),
            heatmap: false,
            heatmapScale: 1,
            sampleInterval: 0.5
        };
    }

    // Handlers stay grouped together below construction for readability.
    // eslint-disable-next-line react/sort-comp
    handleCloseCompilerWarning () {
        this.setState({closedCompilerWarning: true});
    }

    handleTimingUpdate (profileRows, error) {
        this.setState({
            profileRows,
            profiling: error ? false : this.state.profiling,
            profilingError: error ? error.message : this.state.profilingError
        }, () => {
            if (this.state.heatmap) this._updateHeatmap();
        });
    }

    handleSetProfiling (enabled) {
        if (!enabled) {
            this.profiler.stop();
            this.setState({profiling: false, restartRequired: false});
            return;
        }
        const started = this.profiler.start();
        this.setState({
            profiling: started,
            profilingAvailable: !this.props.compilerEnabled || this.profiler.isSamplingAvailable(),
            profilingError: started ? '' : this.profiler.getErrorMessage(),
            restartRequired: started && this.props.compilerEnabled &&
                this.props.vm.runtime.threads.some(thread => thread.isCompiled)
        });
    }

    handleSetAutoStopTimers (enabled) {
        this.props.vm.runtime.debuggerAutoStopTimers = enabled;
        this.props.vm.runtime.emit('DEBUGGER_TIMER_AUTO_STOP_CHANGED', enabled);
        this.setState({autoStopTimers: enabled});
    }

    handleCompilerOptionsChanged () {
        if (this.state.profiling) {
            this.profiler.stop();
            const started = this.profiler.start();
            this.setState({
                profiling: started,
                profilingAvailable: !this.props.vm.runtime.compilerOptions.enabled ||
                    this.profiler.isSamplingAvailable(),
                profilingError: started ? '' : this.profiler.getErrorMessage()
            });
        } else {
            this.setState({profilingAvailable: !this.props.vm.runtime.compilerOptions.enabled ||
                this.profiler.isSamplingAvailable()});
        }
    }

    handleDisableCompiler () {
        this.props.vm.setCompilerOptions({enabled: false});
    }

    handleWorkspaceUpdate () {
        if (!this.state.heatmap) return;
        if (this.heatmapRefreshTimer !== null) clearTimeout(this.heatmapRefreshTimer);
        this.heatmapRefreshTimer = setTimeout(() => {
            this.heatmapRefreshTimer = null;
            this._updateHeatmap();
        }, 0);
    }

    handleClearTiming () {
        this.profileLabels = Object.create(null);
        this.profiler.clear();
        this.props.vm.runtime.emit('DEBUGGER_TIMER_CLEAR_REQUEST');
        this._clearHeatmap();
    }

    handleProjectStart () {
        this.setState({restartRequired: false});
    }

    handleProjectLoaded () {
        this.handleProjectStart();
        this.props.vm.runtime.emit('DEBUGGER_TIMER_CLEAR_REQUEST');
    }

    handleSetHeatmap (heatmap) {
        this.setState({heatmap}, () => {
            this._syncProfilerReporting();
            if (heatmap) this._updateHeatmap();
            else this._clearHeatmap();
        });
    }

    handleSetHeatmapScale (heatmapScale) {
        this.setState({heatmapScale}, this._updateHeatmap);
    }

    handleSetSampleInterval (sampleInterval) {
        const running = this.profiler.setSampleInterval(sampleInterval);
        this.setState({
            sampleInterval,
            profiling: this.state.profiling && running,
            profilingError: running ? '' : this.profiler.getErrorMessage()
        });
    }

    handleSelectTimingRow (row) {
        if (!row.navigable) return;
        const target = this.props.vm.runtime.getTargetById(row.targetId);
        if (target && row.blockId && target.blocks.getBlock(row.blockId)) {
            this.handleSelectTargetBlock(target, row.blockId);
        }
    }

    _clearHeatmap () {
        for (const blockId of Object.keys(this.coloredBlocks)) {
            const entry = this.coloredBlocks[blockId];
            if (entry.block.workspace) entry.block.setColour(...entry.colours);
        }
        this.coloredBlocks = Object.create(null);
    }

    _updateHeatmap () {
        if (!this.state.heatmap) return;
        const workspace = window.ScratchBlocks && window.ScratchBlocks.getMainWorkspace();
        if (!workspace) return;
        const blockTimes = Object.create(null);
        let maximum = 0;
        const showProfile = this.state.profileRows.length > 0;
        const rows = showProfile ? this.state.profileRows : Object.keys(this.props.timers).map(name => {
            const timer = this.props.timers[name];
            return {
                blockId: timer.blockId,
                totalTime: typeof timer.total === 'number' ? timer.total :
                    ((timer.count || 0) * (timer.average || 0))
            };
        });
        for (const row of rows) {
            if (!row.blockId) continue;
            blockTimes[row.blockId] = (blockTimes[row.blockId] || 0) + row.totalTime;
            maximum = Math.max(maximum, blockTimes[row.blockId]);
        }
        if (showProfile) {
            for (const block of workspace.getAllBlocks(false)) {
                if (!block.isShadow() && !Object.prototype.hasOwnProperty.call(blockTimes, block.id)) {
                    blockTimes[block.id] = 0;
                }
            }
        }
        for (const blockId of Object.keys(this.coloredBlocks)) {
            const entry = this.coloredBlocks[blockId];
            if (!Object.prototype.hasOwnProperty.call(blockTimes, blockId) || entry.block.workspace !== workspace) {
                if (entry.block.workspace) entry.block.setColour(...entry.colours);
                delete this.coloredBlocks[blockId];
            }
        }
        if (!maximum) return;
        maximum *= this.state.heatmapScale;
        for (const blockId of Object.keys(blockTimes)) {
            const block = workspace.getBlockById(blockId);
            if (!block) continue;
            if (!Object.prototype.hasOwnProperty.call(this.coloredBlocks, blockId)) {
                this.coloredBlocks[blockId] = {
                    block,
                    heatColour: null,
                    colours: [
                        block.getColour(),
                        block.getColourSecondary(),
                        block.getColourTertiary(),
                        block.getColourQuaternary()
                    ]
                };
            }
            const strength = Math.min(1, blockTimes[blockId] / maximum);
            const red = Math.round(255 * strength);
            const blue = Math.round(255 * (1 - strength));
            const colour = `#${red.toString(16).padStart(2, '0')}00${blue.toString(16).padStart(2, '0')}`;
            const entry = this.coloredBlocks[blockId];
            if (entry.heatColour !== colour) {
                block.setColour(colour, colour, colour, colour);
                entry.heatColour = colour;
            }
        }
    }

    _syncProfilerReporting () {
        this.profiler.setReportingEnabled(this.props.tab === 3 || this.state.heatmap);
    }

    _getBlockLabel (target, block) {
        const runtime = this.props.vm.runtime;
        const workspace = window.ScratchBlocks && window.ScratchBlocks.getMainWorkspace();
        if (target === runtime.getEditingTarget() && workspace) {
            const workspaceBlock = workspace.getBlockById(block.id);
            if (workspaceBlock) return workspaceBlock.toString(80);
        }
        const opcodeLabel = runtime.getLabelForOpcode(block.opcode);
        if (opcodeLabel && opcodeLabel.label) return opcodeLabel.label;
        return block.opcode.replace(/^[^_]+_/, '').replace(/_/g, ' ');
    }

    _findTimingSource (targetId, blockId) {
        if (!blockId) return {target: null, block: null};
        const runtime = this.props.vm.runtime;
        const recordedTarget = targetId && runtime.getTargetById(targetId);
        const recordedBlock = recordedTarget && recordedTarget.blocks.getBlock(blockId);
        if (recordedBlock) return {target: recordedTarget, block: recordedBlock};
        for (const target of runtime.targets) {
            if (!target.isOriginal) continue;
            const block = target.blocks.getBlock(blockId);
            if (block) return {target, block};
        }
        return {target: recordedTarget || null, block: null};
    }

    _getTimingRows () {
        const rows = this.state.profileRows.map(row => {
            let label = row.label;
            let target = null;
            let block = null;
            if (!label && row.targetId && row.blockId) {
                ({target, block} = this._findTimingSource(row.targetId, row.blockId));
                if (block) {
                    label = `${target.getName()}: ${this._getBlockLabel(target, block)}`;
                    this.profileLabels[row.key] = label;
                } else {
                    label = this.profileLabels[row.key] ||
                        `${target ? target.getName() : 'Unknown sprite'}: unavailable block (${row.blockId})`;
                }
            }
            return Object.assign({}, row, {
                label: label || row.blockId || 'Unknown',
                type: 'profile',
                opcode: block ? block.opcode : '',
                targetId: target ? target.id : row.targetId,
                targetName: target ? target.getName() : '',
                navigable: Boolean(target && block),
                sourceResolved: Boolean(target && block),
                averageTime: row.callCount ? row.totalTime / row.callCount : 0,
                minTime: null,
                maxTime: null
            });
        });
        for (const name of Object.keys(this.props.timers)) {
            const timer = this.props.timers[name];
            const source = this._findTimingSource(timer.targetId, timer.blockId);
            const count = timer.count || 0;
            const totalTime = typeof timer.total === 'number' ? timer.total :
                (count && typeof timer.average === 'number' ? timer.average * count : 0);
            rows.push({
                key: `timer:${name}`,
                label: name,
                type: 'timer',
                opcode: source.block ? source.block.opcode : '',
                targetName: source.target ? source.target.getName() : '',
                totalTime,
                averageTime: timer.average || 0,
                minTime: timer.min,
                maxTime: timer.max,
                callCount: count,
                blockId: timer.blockId || null,
                targetId: source.target ? source.target.id : (timer.targetId || null),
                navigable: Boolean(source.target && source.block),
                sourceResolved: Boolean(source.target && source.block)
            });
        }
        return rows;
    }

    handleRuntimeStep () {
        const runtime = this.props.vm.runtime;
        if (runtime.paused) return;

        this.stepCount++;
        const time = performance.now();
        const dt = time - this.lastSampleTime;

        if (dt > 750) {
            const fps = Math.min(Math.round(this.stepCount * 1000 / dt), runtime.frameLoop.framerate || 60);
            this.fpsData.copyWithin(0, 1);
            this.fpsData[19] = fps;
            this.cloneData.copyWithin(0, 1);
            this.cloneData[19] = runtime._cloneCounter;
            this.stepCount = 0;
            this.lastSampleTime = time;

            if (this.props.tab === 2) {
                this.memoryData.copyWithin(0, 1);
                this.memoryData[19] = this.getVmMemory();
                this.setState({
                    fpsData: this.fpsData.slice(),
                    cloneData: this.cloneData.slice(),
                    memoryData: this.memoryData.slice()
                });
            }
        }

        if (this.props.tab === 1) {
            this.setState({threads: runtime.threads.slice()});
        }
    }

    handleSelectTarget (target) {
        this.props.vm.setEditingTarget(target.id);
        this.props.onActivateCodeTab();
    }

    handleSelectTargetBlock (target, blockId) {
        if (!target || !blockId || !this.props.vm.runtime.getTargetById(target.id) ||
            !target.blocks.getBlock(blockId)) return;
        this._clearHeatmap();
        this.props.vm.setEditingTarget(target.id);
        this.props.onActivateCodeTab();
        setTimeout(() => {
            const workspace = window.ScratchBlocks && window.ScratchBlocks.getMainWorkspace();
            const block = workspace && workspace.getBlockById(blockId);
            if (block && !block.isInFlyout) {
                workspace.centerOnBlock(blockId);
                ThreadFlasher.flash(block, () => {
                    if (this.state.heatmap) this._updateHeatmap();
                });
            } else if (this.state.heatmap) {
                this._updateHeatmap();
            }
        }, 0);
    }

    componentDidUpdate (prevProps) {
        if (this.props.tab !== prevProps.tab) this._syncProfilerReporting();
        if (this.props.tab === 2 && prevProps.tab !== 2) {
            // Refresh the chart immediately instead of waiting for the next sample window.
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({
                fpsData: this.fpsData.slice(),
                cloneData: this.cloneData.slice(),
                memoryData: this.memoryData.slice()
            });
        }
    }

    componentDidMount () {
        this.props.vm.runtime.on('RUNTIME_STEP_END', this.handleRuntimeStep);
        this.props.vm.runtime.on('PROJECT_START', this.handleProjectStart);
        this.props.vm.runtime.on('PROJECT_LOADED', this.handleProjectLoaded);
        this.props.vm.on('COMPILER_OPTIONS_CHANGED', this.handleCompilerOptionsChanged);
        this.props.vm.on('workspaceUpdate', this.handleWorkspaceUpdate);
    }

    componentWillUnmount () {
        this.props.vm.runtime.off('RUNTIME_STEP_END', this.handleRuntimeStep);
        this.props.vm.runtime.off('PROJECT_START', this.handleProjectStart);
        this.props.vm.runtime.off('PROJECT_LOADED', this.handleProjectLoaded);
        this.props.vm.off('COMPILER_OPTIONS_CHANGED', this.handleCompilerOptionsChanged);
        this.props.vm.off('workspaceUpdate', this.handleWorkspaceUpdate);
        if (this.heatmapRefreshTimer !== null) clearTimeout(this.heatmapRefreshTimer);
        this.profiler.dispose();
        ThreadFlasher.stop();
        this._clearHeatmap();
    }

    getVmMemory () {
        const vm = this.props.vm;
        let byteLength = 0;
        for (const target of vm.runtime.targets) {
            for (const variable of Object.values(target.variables)) {
                if (typeof variable.value === 'string') {
                    // todo: should this account for non-ASCII characters?
                    byteLength += variable.value.length;
                } else if (typeof variable.value === 'object') {
                    // not very accurate, but good enough.
                    byteLength += JSON.stringify(variable.value).length;
                }
            }
        }
        for (const asset of vm.assets) {
            byteLength += asset.data.byteLength || 0;
        }
        return byteLength;
    }

    render () {
        return (
            <DebuggerComponent
                showCompilerWarning={this.props.compilerEnabled && !this.state.closedCompilerWarning}
                onCloseCompilerWarning={this.handleCloseCompilerWarning}
                onSelectTarget={this.handleSelectTarget}
                onSelectTargetBlock={this.handleSelectTargetBlock}
                threads={this.state.threads}
                sprites={this.props.sprites}
                fpsData={this.state.fpsData}
                memoryData={this.state.memoryData}
                cloneData={this.state.cloneData}
                timingRows={this._getTimingRows()}
                profiling={this.state.profiling}
                profilingAvailable={this.state.profilingAvailable}
                profilingError={this.state.profilingError}
                restartRequired={this.state.restartRequired}
                autoStopTimers={this.state.autoStopTimers}
                heatmap={this.state.heatmap}
                heatmapScale={this.state.heatmapScale}
                sampleInterval={this.state.sampleInterval}
                onSetProfiling={this.handleSetProfiling}
                onSetAutoStopTimers={this.handleSetAutoStopTimers}
                onDisableCompiler={this.handleDisableCompiler}
                onSetSampleInterval={this.handleSetSampleInterval}
                onSetHeatmap={this.handleSetHeatmap}
                onSetHeatmapScale={this.handleSetHeatmapScale}
                onClearTiming={this.handleClearTiming}
                onSelectTimingRow={this.handleSelectTimingRow}
                {...this.props}
            />
        );
    }
}

NBDebugger.propTypes = {
    vm: PropTypes.instanceOf(VM).isRequired,
    compilerEnabled: PropTypes.bool.isRequired,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    tab: PropTypes.number.isRequired,
    dragging: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onDrag: PropTypes.func.isRequired,
    onStartDrag: PropTypes.func.isRequired,
    onEndDrag: PropTypes.func.isRequired,
    onTabClick: PropTypes.func.isRequired,
    onClearLogs: PropTypes.func.isRequired,
    onActivateCodeTab: PropTypes.func.isRequired,
    onInspectThread: PropTypes.func.isRequired,
    sprites: PropTypes.object.isRequired,
    timers: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
    vm: state.scratchGui.vm,
    sprites: state.scratchGui.targets.sprites,
    compilerEnabled: state.scratchGui.tw.compilerOptions.enabled,
    x: state.scratchGui.debugger.x,
    y: state.scratchGui.debugger.y,
    tab: state.scratchGui.debugger.tab,
    dragging: state.scratchGui.debugger.dragging,
    logs: state.scratchGui.debugger.logs,
    projectTitle: state.scratchGui.projectTitle,
    timers: state.scratchGui.debugger.timers,
    performanceChart: state.scratchGui.debugger.performanceChart
});

const mapDispatchToProps = dispatch => ({
    onClose: () => dispatch(closeDebugger()),
    onDrag: (_, data) => dispatch(dragDebugger(data.x, data.y)),
    onStartDrag: () => dispatch(startDrag()),
    onEndDrag: () => dispatch(endDrag()),
    onTabClick: tabIndex => dispatch(setTab(tabIndex)),
    onClearLogs: () => dispatch(clearLogs()),
    onSelectPerformanceChart: chartIndex => dispatch(setPerformanceChart(chartIndex)),
    onActivateCodeTab: () => dispatch(activateTab(BLOCKS_TAB_INDEX)),
    onInspectThread: thread => dispatch(openInspectThreadModal(thread))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(NBDebugger);
