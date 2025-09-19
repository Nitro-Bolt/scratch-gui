import PropTypes from 'prop-types';
import React from 'react';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import bindAll from 'lodash.bindall';
import {connect} from 'react-redux';
import {closeCustomAccentModal} from '../reducers/modals';
import CustomAccentModalComponent from '../components/dm-custom-accent-modal/custom-accent-modal.jsx';
import SavedAccentTemplate from '../components/dm-custom-accent-modal/saved-accent-template.js';
import { persistTheme } from '../lib/themes/themePersistance.js'

// SavedAccentTemplate("*Name 1*", { primaryColor: "#FF0000" })

class CustomAccentModal extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'test',
            'evaluateCss',
            'handleEditClicked',
            'handleDeleteClicked',
            'handleCreateAccentClicked'
        ]);
        this.accents = 0;
        this.CUSTOM_ACCENTS_KEY = "saved_custom_accents"
    }
    test () {
        console.log("test")
    }
    evaluateCss (css) {
        const variableMatch = css.match(/^var\(([\w-]+)\)$/);
        if (variableMatch) {
            return document.documentElement.style.getPropertyValue(variableMatch[1]);
        }
        return css;
    }
    handleEditClicked (name) {
        console.log("edit button clicked")
        console.log(name)
        alert("edit button clicked")
    }
    handleDeleteClicked (name, deleteAccentComponentFromUIwithName) {
        console.log("delete button clicked")
        console.log(name)
        //alert("delete button clicked")
        deleteAccentComponentFromUIwithName(name)
        this.accents -= 1
    }
    handleCreateAccentClicked (refreshUI, CustomAccentDIV, addToUI, deleteAccentComponentFromUIwithName, accentData) {
        //alert("create accent button clicked")
        this.accents += 1
        addToUI(<CustomAccentDIV
            //name={`*Name ${this.accents}*`}
            name={accentData.name}
            //primaryColor={"#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}
            primaryColor={accentData.primaryColor}
            onEditClicked={this.handleEditClicked}
            onDeleteClicked={(name) => {
                this.handleDeleteClicked(name, deleteAccentComponentFromUIwithName);
            }}
        />)
        refreshUI()
        //localStorage.setItem(this.CUSTOM_ACCENTS_KEY, JSON.stringify(JSON.parse(localStorage.getItem(this.CUSTOM_ACCENTS_KEY) || {}) + SavedAccentTemplate(accentData.name, { primaryColor: accentData.primaryColor }, false)))
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