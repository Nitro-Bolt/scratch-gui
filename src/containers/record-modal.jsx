import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import VM from 'scratch-vm';
import {connect} from 'react-redux';
import {encodeAndAddSoundToVM} from '../lib/audio/audio-util.js';

import RecordModalComponent from '../components/record-modal/record-modal.jsx';

import {
    closeSoundRecorder
} from '../reducers/modals';

class RecordModal extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleRecord',
            'handleStopRecording',
            'handlePauseRecording',
            'handleResumeRecording',
            'handlePlay',
            'handleStopPlaying',
            'handleBack',
            'handleSubmit',
            'handleCancel',
            'handleSetPlayhead',
            'handleSetTrimStart',
            'handleSetTrimEnd'
        ]);

        this.state = {
            samples: null,
            encoding: false,
            levels: null,
            playhead: null,
            playing: false,
            recording: false,
            paused: false,
            sampleRate: null,
            trimStart: 0,
            trimEnd: 1
        };
    }
    handleRecord () {
        this.setState({recording: true, paused: false});
    }
    handleStopRecording (samples, sampleRate, levels, trimStart, trimEnd) {
        if (samples.length > 0) {
            this.setState({samples, sampleRate, levels, trimStart, trimEnd, recording: false});
        }
    }
    handlePauseRecording () {
        this.setState({recording: false, paused: true});
    }
    handleResumeRecording () {
        this.handleRecord();
    }
    handlePlay () {
        this.setState({playing: true});
    }
    handleStopPlaying () {
        this.setState({playing: false, playhead: null});
    }
    handleBack () {
        this.setState({playing: false, paused: false, samples: null});
    }
    handleSetTrimEnd (trimEnd) {
        this.setState({trimEnd});
    }
    handleSetTrimStart (trimStart) {
        this.setState({trimStart});
    }
    handleSetPlayhead (playhead) {
        this.setState({playhead});
    }
    handleSubmit () {
        this.setState({encoding: true}, () => {
            const sampleCount = this.state.samples.length;
            const startIndex = Math.floor(this.state.trimStart * sampleCount);
            const endIndex = Math.floor(this.state.trimEnd * sampleCount);
            const clippedSamples = this.state.samples.slice(startIndex, endIndex);

            encodeAndAddSoundToVM(this.props.vm, clippedSamples, this.state.sampleRate, 'recording1',
                () => {
                    this.props.onClose();
                    this.props.onNewSound();
                });
        });
    }
    handleCancel () {
        this.props.onClose();
    }
    render () {
        return (
            <RecordModalComponent
                encoding={this.state.encoding}
                levels={this.state.levels}
                playhead={this.state.playhead}
                playing={this.state.playing}
                recording={this.state.recording}
                paused={this.state.paused}
                sampleRate={this.state.sampleRate}
                samples={this.state.samples}
                trimEnd={this.state.trimEnd}
                trimStart={this.state.trimStart}
                onBack={this.handleBack}
                onCancel={this.handleCancel}
                onPlay={this.handlePlay}
                onRecord={this.handleRecord}
                onSetPlayhead={this.handleSetPlayhead}
                onSetTrimEnd={this.handleSetTrimEnd}
                onSetTrimStart={this.handleSetTrimStart}
                onStopPlaying={this.handleStopPlaying}
                onStopRecording={this.handleStopRecording}
                onPauseRecording={this.handlePauseRecording}
                onResumeRecording={this.handleResumeRecording}
                onSubmit={this.handleSubmit}
            />
        );
    }
}

RecordModal.propTypes = {
    onClose: PropTypes.func,
    onNewSound: PropTypes.func,
    vm: PropTypes.instanceOf(VM)
};

const mapStateToProps = state => ({
    vm: state.scratchGui.vm
});

const mapDispatchToProps = dispatch => ({
    onClose: () => {
        dispatch(closeSoundRecorder());
    }
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(RecordModal);
