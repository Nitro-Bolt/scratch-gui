import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import VM from 'scratch-vm';
import {connect} from 'react-redux';

import ControlsComponent from '../components/controls/controls.jsx';

class Controls extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleCompilerOptionsUpdate',
            'handleGreenFlagClick',
            'handlePauseClick',
            'handleStepClick',
            'handleStopAllClick'
        ]);

        this.state = {compilerEnabled: this.props.vm.runtime.compilerOptions.enabled};
    }
    componentDidMount () {
        this.props.vm.on('COMPILER_OPTIONS_CHANGED', this.handleCompilerOptionsUpdate);
    }
    componentWillUnmount () {
        this.props.vm.off('COMPILER_OPTIONS_CHANGED', this.handleCompilerOptionsUpdate);
    }
    handleCompilerOptionsUpdate () {
        this.setState({
            compilerEnabled: this.props.vm.runtime.compilerOptions.enabled
        });
    }
    handleGreenFlagClick (e) {
        e.preventDefault();
        // tw: implement alt+click and right click to toggle FPS
        if (e.shiftKey || e.altKey || e.type === 'contextmenu') {
            if (e.shiftKey) {
                this.props.vm.setTurboMode(!this.props.turbo);
            }
            if (e.altKey || e.type === 'contextmenu') {
                if (this.props.framerate === 30) {
                    this.props.vm.setFramerate(60);
                } else {
                    this.props.vm.setFramerate(30);
                }
            }
        } else {
            if (!this.props.isStarted) {
                this.props.vm.start();
            }
            this.props.vm.greenFlag();
        }
    }
    handlePauseClick (e) {
        e.preventDefault();
        if (this.props.vm.runtime.paused) {
            this.props.vm.runtime.resume();
        } else {
            this.props.vm.runtime.pause();
        }
    }
    handleStepClick (e) {
        e.preventDefault();
        this.props.vm.runtime._step(true /* stepPausedThreads */);
    }
    handleStopAllClick (e) {
        e.preventDefault();
        this.props.vm.stopAll();
    }
    render () {
        const {
            vm, // eslint-disable-line no-unused-vars
            isStarted, // eslint-disable-line no-unused-vars
            projectRunning,
            projectPaused,
            turbo,
            ...props
        } = this.props;
        return (
            <ControlsComponent
                {...props}
                active={!projectPaused && projectRunning && isStarted}
                compilerEnabled={this.state.compilerEnabled}
                turbo={turbo}
                paused={projectPaused}
                onGreenFlagClick={this.handleGreenFlagClick}
                onPauseClick={this.handlePauseClick}
                onStepClick={this.handleStepClick}
                onStopAllClick={this.handleStopAllClick}
            />
        );
    }
}

Controls.propTypes = {
    isStarted: PropTypes.bool.isRequired,
    projectRunning: PropTypes.bool.isRequired,
    projectPaused: PropTypes.bool.isRequired,
    turbo: PropTypes.bool.isRequired,
    framerate: PropTypes.number.isRequired,
    interpolation: PropTypes.bool.isRequired,
    isSmall: PropTypes.bool,
    vm: PropTypes.instanceOf(VM)
};

const mapStateToProps = state => ({
    isStarted: state.scratchGui.vmStatus.started,
    projectRunning: state.scratchGui.vmStatus.running,
    projectPaused: state.scratchGui.vmStatus.paused,
    framerate: state.scratchGui.tw.framerate,
    interpolation: state.scratchGui.tw.interpolation,
    turbo: state.scratchGui.vmStatus.turbo
});
// no-op function to prevent dispatch prop being passed to component
const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Controls);
