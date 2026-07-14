import React from 'react';
import PropTypes from 'prop-types';
import bindAll from 'lodash.bindall';
import AudioSelectorComponent from '../components/audio-trimmer/audio-selector.jsx';
import {getEventXY} from '../lib/touch-utils';
import DragRecognizer from '../lib/drag-recognizer';

const MIN_LENGTH = 0.01;

class AudioSelector extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleNewSelectionMouseDown',
            'handleTrimStartMouseDown',
            'handleTrimEndMouseDown',
            'handleTrimStartMouseMove',
            'handleTrimEndMouseMove',
            'handleTrimStartMouseUp',
            'handleTrimEndMouseUp',
            'storeRef'
        ]);

        this.state = {
            trimStart: props.trimStart,
            trimEnd: props.trimEnd
        };

        this.clickStartTime = 0;

        this.playheadAttached = false;

        this.trimStartDragRecognizer = new DragRecognizer({
            onDrag: this.handleTrimStartMouseMove,
            onDragEnd: this.handleTrimStartMouseUp,
            touchDragAngle: 90,
            distanceThreshold: 0
        });
        this.trimEndDragRecognizer = new DragRecognizer({
            onDrag: this.handleTrimEndMouseMove,
            onDragEnd: this.handleTrimEndMouseUp,
            touchDragAngle: 90,
            distanceThreshold: 0
        });
    }
    componentWillReceiveProps (newProps) {
        const {trimStart, trimEnd} = this.props;
        if (newProps.trimStart === trimStart && newProps.trimEnd === trimEnd) return;
        this.setState({
            trimStart: newProps.trimStart,
            trimEnd: newProps.trimEnd
        });
    }
    clearSelection () {
        this.props.onSetTrim(null, null);
    }
    handleNewSelectionMouseDown (e) {
        const {width, left} = this.containerElement.getBoundingClientRect();
        this.initialTrimEnd = (getEventXY(e).x - left) / width;
        this.initialTrimStart = this.initialTrimEnd;
        this.props.onSetTrim(this.initialTrimStart, this.initialTrimEnd);
        this.props.onUpdatePlayhead(this.initialTrimStart);

        this.clickStartTime = Date.now();

        this.containerSize = width;
        this.trimEndDragRecognizer.start(e);

        e.preventDefault();
    }
    handleTrimStartMouseMove (currentOffset, initialOffset) {
        const dx = (currentOffset.x - initialOffset.x) / this.containerSize;
        const newTrim = Math.max(0, Math.min(1, this.initialTrimStart + dx));
        console.log(this.initialTrimStart, this.props.playhead);
        if (this.playheadAttached || newTrim > this.props.playhead) {
            this.props.onUpdatePlayhead(Math.min(newTrim, this.initialTrimEnd));
        }
        if (newTrim > this.initialTrimEnd) {
            this.setState({
                trimStart: this.initialTrimEnd,
                trimEnd: newTrim
            });
        } else {
            this.setState({
                trimStart: newTrim,
                trimEnd: this.initialTrimEnd
            });
        }
    }
    handleTrimEndMouseMove (currentOffset, initialOffset) {
        const dx = (currentOffset.x - initialOffset.x) / this.containerSize;
        const newTrim = Math.min(1, Math.max(0, this.initialTrimEnd + dx));
        if (newTrim < this.initialTrimStart) {
            this.props.onUpdatePlayhead(newTrim);
        } else if (this.props.playhead < this.initialTrimStart) {
            this.props.onUpdatePlayhead(this.initialTrimStart);
        }
        if (newTrim < this.initialTrimStart) {
            this.setState({
                trimStart: newTrim,
                trimEnd: this.initialTrimStart
            });
        } else {
            this.setState({
                trimStart: this.initialTrimStart,
                trimEnd: newTrim
            });
        }
    }
    handleTrimStartMouseUp () {
        this.props.onSetTrim(this.state.trimStart, this.state.trimEnd);
    }
    handleTrimEndMouseUp () {
        // If the selection was made quickly (tooFast) and is small (tooShort),
        // deselect instead. This allows click-to-deselect even if you drag
        // a little bit by accident. It also allows very quickly making a
        // selection, as long as it is above a minimum length.
        const tooFast = (Date.now() - this.clickStartTime) < MIN_DURATION;
        const tooShort = (this.state.trimEnd - this.state.trimStart) < MIN_LENGTH;
        if (tooFast && tooShort) {
            this.clearSelection();
        } else {
            this.props.onSetTrim(this.state.trimStart, this.state.trimEnd);
        }
    }
    handleTrimStartMouseDown (e) {
        this.containerSize = this.containerElement.getBoundingClientRect().width;
        this.trimStartDragRecognizer.start(e);
        this.initialTrimStart = this.props.trimStart;
        this.initialTrimEnd = this.props.trimEnd;
        // account for a miniscule amount of error. i don't trust such long decimals
        this.playheadAttached = Math.abs(this.props.trimStart - this.props.playhead) < 0.001;
        e.stopPropagation();
    }
    handleTrimEndMouseDown (e) {
        this.containerSize = this.containerElement.getBoundingClientRect().width;
        this.trimEndDragRecognizer.start(e);
        this.initialTrimEnd = this.props.trimEnd;
        this.initialTrimStart = this.props.trimStart;
        e.stopPropagation();
    }
    storeRef (el) {
        this.containerElement = el;
    }
    render () {
        return (
            <AudioSelectorComponent
                containerRef={this.storeRef}
                playhead={this.props.playhead}
                trimEnd={this.state.trimEnd}
                trimStart={this.state.trimStart}
                onNewSelectionMouseDown={this.handleNewSelectionMouseDown}
                onTrimEndMouseDown={this.handleTrimEndMouseDown}
                onTrimStartMouseDown={this.handleTrimStartMouseDown}
            />
        );
    }
}

AudioSelector.propTypes = {
    onSetTrim: PropTypes.func,
    playhead: PropTypes.number,
    trimEnd: PropTypes.number,
    trimStart: PropTypes.number,
    onUpdatePlayhead: PropTypes.func
};

export default AudioSelector;
