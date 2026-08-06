import React from 'react';
import VM from 'scratch-vm';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import bindAll from 'lodash.bindall';
import DebuggerComponent from '../components/nb-debugger/debugger.jsx';

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


class NBDebugger extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleCloseCompilerWarning',
            'handleRuntimeStep',
            'handleSelectTarget'
        ]);

        this.stepCount = 0;
        this.lastSampleTime = performance.now() + 3000;
        this.fpsData = new Array(20).fill(0);
        this.cloneData = new Array(20).fill(0);
        this.memoryData = new Array(20).fill(0);
        this.sampleMemory = 0;

        this.state = {
            closedCompilerWarning: false,
            fpsData: this.fpsData.slice(),
            cloneData: this.cloneData.slice(),
            memoryData: this.memoryData.slice(),
            threads: [],
        };
    }

    getVmMemory () {
        const vm = this.props.vm;
        let byteLength = 0;
        for (const target of vm.runtime.targets) {
            Object.values(target.variables).forEach(v => {
                if (typeof v.value === 'string') {
                    // todo: should this account for non-ASCII characters?
                    byteLength += v.value.length;
                } else if (typeof v.value === 'object') {
                    // not very accurate, but good enough.
                    byteLength += JSON.stringify(v.value).length;
                }
            });
        }
        for (const asset of vm.assets) {
            byteLength += asset.data.byteLength || 0;
        }
        return byteLength;
    }

    handleCloseCompilerWarning () {
        this.setState({closedCompilerWarning: true});
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
                this.sampleMemory = this.getVmMemory();
                console.log(this.sampleMemory);
                this.memoryData.copyWithin(0, 1);
                this.memoryData[19] = this.sampleMemory;
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

    componentDidUpdate (prevProps) {
        if (this.props.tab === 2 && prevProps.tab !== 2) {
            this.setState({
                fpsData: this.fpsData.slice(),
                cloneData: this.cloneData.slice(),
                memoryData: this.memoryData.slice()
            });
        }
    }

    componentDidMount () {
        this.props.vm.runtime.on('RUNTIME_STEP_END', this.handleRuntimeStep);
    }

    componentWillUnmount () {
        this.props.vm.runtime.off('RUNTIME_STEP_END', this.handleRuntimeStep);
    }

    render () {
        return (
            <DebuggerComponent
                showCompilerWarning={this.props.compilerEnabled && !this.state.closedCompilerWarning}
                onCloseCompilerWarning={this.handleCloseCompilerWarning}
                onSelectTarget={this.handleSelectTarget}
                threads={this.state.threads}
                sprites={this.props.sprites}
                fpsData={this.state.fpsData}
                memoryData={this.state.memoryData}
                cloneData={this.state.cloneData}
                timers={this.props.timers}
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
    timers: PropTypes.object.isRequired,
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
    onActivateCodeTab: () => dispatch(activateTab(BLOCKS_TAB_INDEX))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(NBDebugger);