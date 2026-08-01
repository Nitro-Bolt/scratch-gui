import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {intlShape} from 'react-intl';
import bindAll from 'lodash.bindall';
import {closeExtensionManagerModal} from '../reducers/modals';
import ExtensionManagerModalComponent from '../components/nb-extension-manager-modal/extension-manager-modal.jsx';

class NBExtensionManagerModal extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleClose',
            'removeExtension',
            'handleMultiSelectState',
            'updateExtensionList',
            'removeExtensions',
            'handleDragStart',
            'handleDragEnd',
            'handleDragOver',
            'handleDrop'
        ]);
        this.state = {
            multiSelect: false,
            draggable: true,
            dragging: null,
            extensions: []
        };
    }

    handleClose () {
        this.props.onClose();
    }

    removeExtension (extension) {
        this.props.vm.extensionManager.removeExtension(extension);
        this.props.onClose();
    }

    handleMultiSelectState () {
        if (!this.state.multiSelect) {
            this.setState({draggable: false});
            this.setState({extensions: []});
        } else {
            this.setState({draggable: true});
        }
        this.setState({multiSelect: !this.state.multiSelect});
    }

    updateExtensionList (checkbox) {
        if (checkbox.target.checked) {
            this.setState({extensions: [...this.state.extensions, checkbox.target.value]});
        } else {
            this.setState({extensions: this.state.extensions.filter(extension => extension !== checkbox.target.value)});
        }
    }

    removeExtensions (extensions) {
        extensions.forEach(extension => {
            this.props.vm.extensionManager.removeExtension(extension);
        });
        this.props.onClose();
    }

    handleDragStart (item) {
        this.setState({dragging: item});
    }

    handleDragEnd () {
        this.setState({dragging: null});
    }

    handleDragOver (e) {
        e.preventDefault();
    }

    handleDrop (index) {
        this.props.vm.extensionManager.reorderExtension(this.state.dragging, index);
    }

    render () {
        return (
            <ExtensionManagerModalComponent
                onClose={this.handleClose}
                removeExtension={this.removeExtension}
                changeMultiSelectState={this.handleMultiSelectState}
                multiSelect={this.state.multiSelect}
                draggable={this.state.draggable}
                updateExtensionList={this.updateExtensionList}
                extensions={this.state.extensions}
                removeExtensions={this.removeExtensions}
                handleDragStart={this.handleDragStart}
                handleDragEnd={this.handleDragEnd}
                handleDragOver={this.handleDragOver}
                handleDrop={this.handleDrop}
                vm={this.props.vm}
            />
        );
    }
}

NBExtensionManagerModal.propTypes = {
    intl: intlShape,
    onClose: PropTypes.func.isRequired,
    vm: PropTypes.shape({
        extensionManager: PropTypes.shape({
            removeExtension: PropTypes.func,
            reorderExtension: PropTypes.func
        })
    })
};

const mapStateToProps = state => ({
    vm: state.scratchGui.vm
});

const mapDispatchToProps = dispatch => ({
    onClose: () => dispatch(closeExtensionManagerModal())
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(NBExtensionManagerModal);
