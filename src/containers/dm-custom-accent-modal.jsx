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
            'handleDeleteClicked'
        ]);
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
        alert("delete button clicked")
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