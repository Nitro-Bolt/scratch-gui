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
    endDrag
} from '../reducers/debugger';


class NBDebugger extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [

        ]);
    }

    render () {
        return (
            <DebuggerComponent
                {...this.props}
            />
        );
    }
}

NBDebugger.propTypes = {
    vm: PropTypes.instanceOf(VM),
    x: PropTypes.number,
    y: PropTypes.number,
    dragging: PropTypes.bool
};

const mapStateToProps = state => ({
    vm: state.scratchGui.vm,
    x: state.scratchGui.debugger.x,
    y: state.scratchGui.debugger.y,
    dragging: state.scratchGui.debugger.dragging
});

const mapDispatchToProps = dispatch => ({
    onClose: () => dispatch(closeDebugger()),
    onDrag: (_, data) => dispatch(dragDebugger(data.x, data.y)),
    onStartDrag: () => dispatch(startDrag()),
    onEndDrag: () => dispatch(endDrag())
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(NBDebugger);