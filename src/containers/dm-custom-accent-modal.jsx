import PropTypes from 'prop-types';
import React from 'react';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import bindAll from 'lodash.bindall';
import {connect} from 'react-redux';
import {closeCustomAccentModal} from '../reducers/modals';
import CustomAccentModalComponent from '../components/dm-custom-accent-modal/custom-accent-modal.jsx';

class CustomAccentModal extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'test',
            'handleEditClicked',
            'handleDeleteClicked',
            'handleCreateAccentClicked'
        ]);
        this.accents = 0
    }
    test () {
        console.log("test")
    }
    handleEditClicked (name) {
        console.log("edit button clicked")
        console.log(name)
        alert("edit button clicked")
    }
    handleDeleteClicked (name) {
        console.log("delete button clicked")
        console.log(name)
        //alert("delete button clicked")
    }
    handleCreateAccentClicked (refreshUI, CustomAccentDIV, addToUI, deleteAccentComponentFromUIwithName) {
        //alert("create accent button clicked")
        this.accents += 1
        addToUI(<CustomAccentDIV
            name={`*Name ${this.accents}*`}
            primaryColor={"#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}
            onEditClicked={this.handleEditClicked}
            onDeleteClicked={(name) => {
                this.handleDeleteClicked(name, deleteAccentComponentFromUIwithName);
            }}
        />)
        refreshUI()
    }
    render () {
        const {
            /* eslint-disable no-unused-vars */
            onClose,
            /* eslint-enable no-unused-vars */
            ...props
        } = this.props;
        return (
            <CustomAccentModalComponent
                onClose={this.props.onClose}
                onEditClicked={this.handleEditClicked}
                onDeleteClicked={this.handleDeleteClicked}
                onCreateAccentClicked={this.handleCreateAccentClicked}
                {...props}
            />
        );
    }
}

CustomAccentModal.propTypes = {
    intl: intlShape,
    onClose: PropTypes.func,
};

const mapDispatchToProps = dispatch => ({
    onClose: () => dispatch(closeCustomAccentModal())
});

export default injectIntl(connect(
    (_ => ({})),
    mapDispatchToProps
)(CustomAccentModal));