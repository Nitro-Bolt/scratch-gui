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
    clearLogs
} from '../reducers/debugger';
import {activateTab, BLOCKS_TAB_INDEX} from '../reducers/editor-tab.js';


class NBDebugger extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleCompileOptionsChange',
            'handleCloseCompilerWarning',
            'handleSelectTarget'
        ]);
        this.state = {
            compilerEnabled: props.vm.runtime.compilerOptions.enabled,
            closedCompilerWarning: false
        };
    }

    handleCompileOptionsChange () {
        const runtime = this.props.vm.runtime;
        this.setState({compilerEnabled: runtime.compilerOptions.enabled});
    }

    handleCloseCompilerWarning () {
        this.setState({closedCompilerWarning: true});
    }

    handleSelectTarget (target) {
        this.props.vm.setEditingTarget(target.id);
        this.props.onActivateCodeTab();
    }

    componentDidMount () {
        this.props.vm.on('COMPILER_OPTIONS_CHANGED', this.handleCompileOptionsChange);
    }

    componentWillUnmount () {
        this.props.vm.off('COMPILER_OPTIONS_CHANGED', this.handleCompileOptionsChange);
    }

    render () {
        return (
            <DebuggerComponent
                showCompilerWarning={this.state.compilerEnabled && !this.state.closedCompilerWarning}
                onCloseCompilerWarning={this.handleCloseCompilerWarning}
                onSelectTarget={this.handleSelectTarget}
                {...this.props}
            />
        );
    }
}

NBDebugger.propTypes = {
    vm: PropTypes.instanceOf(VM).isRequired,
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
    darkMode: PropTypes.bool.isRequired
};

const mapStateToProps = state => ({
    vm: state.scratchGui.vm,
    x: state.scratchGui.debugger.x,
    y: state.scratchGui.debugger.y,
    tab: state.scratchGui.debugger.tab,
    dragging: state.scratchGui.debugger.dragging,
    logs: state.scratchGui.debugger.logs,
    darkMode: state.scratchGui.theme.theme.gui === 'dark'
});

const mapDispatchToProps = dispatch => ({
    onClose: () => dispatch(closeDebugger()),
    onDrag: (_, data) => dispatch(dragDebugger(data.x, data.y)),
    onStartDrag: () => dispatch(startDrag()),
    onEndDrag: () => dispatch(endDrag()),
    onTabClick: tabIndex => dispatch(setTab(tabIndex)),
    onClearLogs: () => dispatch(clearLogs()),
    onActivateCodeTab: () => dispatch(activateTab(BLOCKS_TAB_INDEX))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(NBDebugger);