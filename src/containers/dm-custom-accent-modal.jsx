import PropTypes from 'prop-types';
import React from 'react';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import bindAll from 'lodash.bindall';
import {connect} from 'react-redux';
import {closeCustomAccentModal} from '../reducers/modals';
import {setTheme} from '../reducers/theme';
import CustomAccentModalComponent from '../components/dm-custom-accent-modal/custom-accent-modal.jsx';
import SavedAccentTemplate from '../components/dm-custom-accent-modal/saved-accent-template.js';
import { persistThemeCustom, persistTheme } from '../lib/themes/themePersistance.js'
import { Theme } from '../lib/themes/index.js'
import downloadBlob from '../lib/download-blob.js'

// SavedAccentTemplate("*Name 1*", { primaryColor: "#FF0000" })

class CustomAccentModal extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'test',
            'evaluateCss',
            'handleEditClicked',
            'handleDeleteClicked',
            'handleCreateAccentClicked',
            'activateAccent',
            'deactivateAccent',
            'handleExportAccents',
            'handleImportAccents'
        ]);
        this.props = props
        this.accents = 0;
        this.CUSTOM_ACCENTS_KEY = "tw:accent:customAccents"
        this.CUSTOM_ACCENTS_KEY_ON = "tw:accent:customAccentsOn"

        //if (localStorage) localStorage.pushArrayItem_INTERNAL(this.CUSTOM_ACCENTS_KEY_ON, JSON.stringify([]));
        if (localStorage.getItem(this.CUSTOM_ACCENTS_KEY) == null) localStorage.setItem(this.CUSTOM_ACCENTS_KEY, JSON.stringify([]));
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
        this.refreshUI = refreshUI
        this.accents += 1
        addToUI(<CustomAccentDIV
            //name={`*Name ${this.accents}*`}
            name={accentData.name}
            //primaryColor={"#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}
            primaryColor={accentData.primaryColor}
            primaryColorDark={accentData.primaryColorDark}
            onEditClicked={this.handleEditClicked}
            onDeleteClicked={(name) => {
                this.handleDeleteClicked(name, deleteAccentComponentFromUIwithName);
            }}
            onActivated={(accentData, refreshUI) => {this.activateAccent(accentData, refreshUI)}}
            onDeactivated={(accentData, refreshUI) => {this.deactivateAccent(accentData, refreshUI)}}
        />)
        /*persistThemeCustom({
            primaryColor: accentData.primaryColor,
            primaryColorDark: accentData.primaryColorDark
        })
        refreshUI()*/
        const tempCustomAccentObj = JSON.parse(localStorage.getItem(this.CUSTOM_ACCENTS_KEY)) == 1 ? [] : JSON.parse(localStorage.getItem(this.CUSTOM_ACCENTS_KEY))
        tempCustomAccentObj.push(SavedAccentTemplate(accentData.name, {
            primaryColor: accentData.primaryColor,
            primaryColorDark: accentData.primaryColorDark
        }, false))
        localStorage.setItem(this.CUSTOM_ACCENTS_KEY, JSON.stringify(tempCustomAccentObj))
        //if (localStorage) localStorage.pushArrayItem_INTERNAL(this.CUSTOM_ACCENTS_KEY, accentData);
    }
    activateAccent (accentData, refreshUI) {
        //localStorage.setItem(this.CUSTOM_ACCENTS_KEY_ON, JSON.stringify(JSON.parse(localStorage.getItem(this.CUSTOM_ACCENTS_KEY_ON)).push(accentData)))
        persistThemeCustom({
            primaryColor: accentData.primaryColor,
            primaryColorDark: accentData.primaryColorDark
        })
    }
    deactivateAccent (accentData, refreshUI) {
        //localStorage.setItem(this.CUSTOM_ACCENTS_KEY_ON, JSON.stringify(JSON.parse(localStorage.getItem(this.CUSTOM_ACCENTS_KEY_ON)).push(accentData)))
        this.props.onChangeTheme(this.props.theme.set(localStorage.getItem("tw:accent")))
    }
    handleExportAccents() {
        let savedAccents = localStorage.getItem(this.CUSTOM_ACCENTS_KEY)
        let accents = JSON.parse(savedAccents) == 1 ? [] : JSON.parse(savedAccents)
        let blob = new Blob([JSON.stringify(accents)])
        downloadBlob('custom-accents.json', blob)
    }
    async handleImportAccents(reloadComponents) {
        async function readFile(file) {
            return await file.text();
        }

        let result;

        const pickerOpts = {
            types: [
                {
                    description: "JSON",
                    accept: {
                        "json/*": [".json"],
                    },
                },
            ],
            excludeAcceptAllOption: true,
            multiple: false,
        };

        async function getFile() {
            const [fileHandle] = await window.showOpenFilePicker(pickerOpts);
            return await fileHandle.getFile();
        }
        
        getFile()
            .then(readFile)
            .then((e) => {
                const parsedResult = JSON.parse(e) == 1 ? [] : JSON.parse(e)
                localStorage.setItem(this.CUSTOM_ACCENTS_KEY, JSON.stringify(parsedResult))
                reloadComponents(parsedResult)
            })
            .catch((e) => {
                console.error(e)
            });
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
                onActivated={this.activateAccent}
                onDeactivated={this.deactivateAccent}
                onExportAccents={this.handleExportAccents}
                onImportAccents={this.handleImportAccents}
                {...props}
            />
        );
    }
}

CustomAccentModal.propTypes = {
    intl: intlShape,
    onClose: PropTypes.func,
    onChangeTheme: PropTypes.func,
    theme: PropTypes.instanceOf(Theme)
};

const mapStateToProps = state => ({
    theme: state.scratchGui.theme.theme
})

const mapDispatchToProps = dispatch => ({
    onChangeTheme: theme => {
        dispatch(setTheme(theme));
        //dispatch(closeSettingsMenu());
        persistTheme(theme);
    },
    onClose: () => dispatch(closeCustomAccentModal())
});

export default injectIntl(connect(
    mapStateToProps,
    mapDispatchToProps
)(CustomAccentModal));