import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';

import SpriteInfoComponent from '../components/sprite-info/sprite-info.jsx';

class SpriteInfo extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleClickVisible',
            'handleClickNotVisible',
            'handlePressVisible',
            'handlePressNotVisible',
            'handleClickDraggable',
            'handleClickNotDraggable',
            'handlePressDraggable',
            'handlePressNotDraggable'
        ]);
    }
    handleClickVisible (e) {
        e.preventDefault();
        this.props.onChangeVisibility(true);
    }
    handleClickNotVisible (e) {
        e.preventDefault();
        this.props.onChangeVisibility(false);
    }
    handlePressVisible (e) {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            this.props.onChangeVisibility(true);
        }
    }
    handlePressNotVisible (e) {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            this.props.onChangeVisibility(false);
        }
    }
    handleClickDraggable (e) {
        e.preventDefault();
        this.props.onChangeDraggability(true);
    }
    handleClickNotDraggable (e) {
        e.preventDefault();
        this.props.onChangeDraggability(false);
    }
    handlePressDraggable (e) {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            this.props.onChangeDraggability(true);
        }
    }
    handlePressNotDraggable (e) {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            this.props.onChangeDraggability(false);
        }
    }
    render () {
        return (
            <SpriteInfoComponent
                {...this.props}
                onClickNotVisible={this.handleClickNotVisible}
                onClickVisible={this.handleClickVisible}
                onPressNotVisible={this.handlePressNotVisible}
                onPressVisible={this.handlePressVisible}
                onClickNotDraggable={this.handleClickNotDraggable}
                onClickDraggable={this.handleClickDraggable}
                onPressNotDraggable={this.handlePressNotDraggable}
                onPressDraggable={this.handlePressDraggable}
            />
        );
    }
}

SpriteInfo.propTypes = {
    ...SpriteInfoComponent.propTypes,
    onChangeDirection: PropTypes.func,
    onChangeName: PropTypes.func,
    onChangeSize: PropTypes.func,
    onChangeVolume: PropTypes.func,
    onChangeVisibility: PropTypes.func,
    onChangeDraggability: PropTypes.func,
    onChangeLayer: PropTypes.func,
    onChangeX: PropTypes.func,
    onChangeY: PropTypes.func,
    x: PropTypes.number,
    y: PropTypes.number
};

export default SpriteInfo;
