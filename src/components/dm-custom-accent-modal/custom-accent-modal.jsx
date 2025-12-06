import { defineMessages, FormattedMessage, intlShape, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import classNames from 'classnames';
import bindAll from 'lodash.bindall';
import Box from '../box/box.jsx';
import Modal from '../../containers/modal.jsx';
import FancyCheckbox from '../tw-fancy-checkbox/checkbox.jsx';
import Input from '../forms/input.jsx';
import BufferedInputHOC from '../forms/buffered-input-hoc.jsx';
import styles from './custom-accent-modal.css';

import editIcon from './edit.svg';
import deleteIcon from './delete.svg';

import {isUnsupported} from './unsupported-browsers.js';

/* eslint-disable react/no-multi-comp */

const BufferedInput = BufferedInputHOC(Input);

const CUSTOM_ACCENTS_KEY = "tw:accent:customAccents";

const messages = defineMessages({
    title: {
        defaultMessage: 'Custom Accents (Beta)',
        description: 'Title of the custom accents modal',
        id: 'dm.customAccentModal.title'
    },
    help: {
        defaultMessage: 'Click for help',
        description: 'Hover text of help icon in the custom accents modal',
        id: 'dm.customAccentModal.help'
    }
});

const Gap = props => (
    <div
        className={styles.gap}
        style={{
            height: props.height
        }}
    />
);
Gap.propTypes = {
    height: PropTypes.string
};

const Header = props => (
    <div className={styles.header}>
        {props.children}
        <div className={styles.divider} />
    </div>
);
Header.propTypes = {
    children: PropTypes.node
};

const CustomAccentComponent = props => {
    const [isEnabled, setEnabled] = useState(false);
    const [upForDeletion, setUpForDeletion] = useState(false);

    const CUSTOM_ACCENTS_ARRAY = JSON.parse(localStorage.getItem(CUSTOM_ACCENTS_KEY)) == 1 ? [] : JSON.parse(localStorage.getItem(CUSTOM_ACCENTS_KEY))

    const tickEvent = new CustomEvent("TickEvent", {
        details: {}
    })
    window.tickEvent = tickEvent;

    setTimeout(() => {
        for (const accentData of (CUSTOM_ACCENTS_ARRAY == [] ? [{ nothing: true }] : CUSTOM_ACCENTS_ARRAY)) {
            if (accentData.nothing) continue;
            if (accentData.name == props.name) {
                if (accentData.enabled == true) setEnabled(true)
            }
        }
    }, 500)

    const setEnabled2 = (value) => {
        if (!!upForDeletion) {
            setEnabled(false)
        } else {
            setEnabled(value)
            let NEW_CUSTOM_ACCENTS_ARRAY = (CUSTOM_ACCENTS_ARRAY == [] ? [{ nothing: true }] : CUSTOM_ACCENTS_ARRAY)
            for (const accentData of NEW_CUSTOM_ACCENTS_ARRAY) {
                if (accentData.nothing) continue;
                if (accentData.name == props.name) {
                    accentData.enabled = value
                } else {
                    accentData.enabled = false
                }
            }
            localStorage.setItem(CUSTOM_ACCENTS_KEY, JSON.stringify(NEW_CUSTOM_ACCENTS_ARRAY))
        }
    }

    const getStateData = () => {
        return [isEnabled, setEnabled, upForDeletion, setUpForDeletion]
    }

    const tickLoop = function() {
        let isEnabled = getStateData()[0]
        let setEnabled = getStateData()[1]
        let upForDeletion = getStateData()[2]
        if (!upForDeletion) {
            let NEW_CUSTOM_ACCENTS_ARRAY = (CUSTOM_ACCENTS_ARRAY == [] ? [{ nothing: true }] : CUSTOM_ACCENTS_ARRAY)
            for (const accentData of NEW_CUSTOM_ACCENTS_ARRAY) {
                if (accentData.nothing) continue;
                if (accentData.name == props.name) {
                    if (accentData.enabled !== isEnabled) {
                        setEnabled(accentData.enabled)
                    }
                }
            }
        }
        setTimeout(tickLoop, 200)
    }
    tickLoop()
    
    return (
        <div
            className={classNames(styles.divStretchy, 
                !!isEnabled ? styles.enabledAccent : styles.changeOnHover
            )}
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}
            onClick={() => {
                if (!upForDeletion) {
                    if (!!isEnabled) {
                        setEnabled2(false)
                        props.onDeactivated({
                            name: props.name,
                            primaryColor: props.primaryColor,
                            primaryColorDark: props.primaryColorDark
                        }, props.refreshUI)
                    } else {
                        setEnabled2(true)
                        props.onActivated({
                            name: props.name,
                            primaryColor: props.primaryColor,
                            primaryColorDark: props.primaryColorDark
                        }, props.refreshUI)
                    }
                }
            }}
        >
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}>
                <div
                    className={styles.accentIconOuter}
                    style={{
                        backgroundColor: props.primaryColor ?? `#000000`
                    }}
                />
                <span style={{ lineHeight: '32px' }}>{props.name}</span>
            </div>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                alignItems: 'flex-end',
                flexShrink: '0'
            }}>
                {/*<div
                    className={classNames(styles.iconButton)}
                    type={"edit"}
                    onClick={() => props.onEditClicked(props.name)}
                >
                    <img
                        src={editIcon}
                        draggable={"false"}
                    />
                </div>*/}
                <div
                    className={classNames(styles.iconButton)}
                    type={"delete"}
                    onClick={async () => {
                        setUpForDeletion(true)
                        await new Promise(r => setTimeout(r, 150))
                        setEnabled2(false)
                        props.onDeactivated({
                            name: props.name,
                            primaryColor: props.primaryColor,
                            primaryColorDark: props.primaryColorDark
                        }, props.refreshUI)
                        setUpForDeletion(true)
                        props.onDeactivated({
                            name: props.name,
                            primaryColor: props.primaryColor,
                            primaryColorDark: props.primaryColorDark
                        }, props.refreshUI)
                        for (var i = 0; i < 10; i++) {
                            props.onDeleteClicked(props.name)
                        }
                    }}
                >
                    <img
                        src={deleteIcon}
                        draggable={"false"}
                    />
                </div>
            </div>
        </div>
    );
}

CustomAccentComponent.propTypes = {
    name: PropTypes.string,
    primaryColor: PropTypes.string,
    primaryColorDark: PropTypes.string,
    onEditClicked: PropTypes.func.isRequired,
    onDeleteClicked: PropTypes.func.isRequired,
    onActivated: PropTypes.func.isRequired,
    onDeactivated: PropTypes.func.isRequired,
    refreshUI: PropTypes.func.isRequired,
};

const CustomAccentModalComponent = function (props) {
    const [customAccentComponents, setCustomAccentComponents] = useState([]);
    const [_, setTick] = useState(0);
    const [isNewAccUIOpen, setIsNewAccUIOpen] = useState(false);
    const [hasAccentsBeenRendered, setHasAccentsBeenRendered] = useState(false);

    if (localStorage.getItem(CUSTOM_ACCENTS_KEY) == null) localStorage.setItem(CUSTOM_ACCENTS_KEY, JSON.stringify([]));

    function refreshUI() {
        //setCustomAccentComponents((prev) => [...prev]);
        setTick((t) => t)
    }

    function addToUI(node) {
        setCustomAccentComponents((prev) => [...prev, node]);
    }

    function deleteAccentComponentFromUIwithName(name) {
        setCustomAccentComponents((prev) =>
            prev.filter((child) => child.props.name !== name)
        );
        const CUSTOM_ACCENTS_ARRAY = JSON.parse(localStorage.getItem(CUSTOM_ACCENTS_KEY)) == 1 ? [] : JSON.parse(localStorage.getItem(CUSTOM_ACCENTS_KEY))

        let NEW_CUSTOM_ACCENTS_ARRAY = (CUSTOM_ACCENTS_ARRAY == [] ? [{ nothing: true }] : CUSTOM_ACCENTS_ARRAY)
        /*for (const accentData of NEW_CUSTOM_ACCENTS_ARRAY) {
            if (accentData.nothing) continue;
            if (accentData.name == name) {
                const index = NEW_CUSTOM_ACCENTS_ARRAY.indexOf(accentData);
                if (index > -1) {
                    NEW_CUSTOM_ACCENTS_ARRAY.splice(index, 1);
                }
            }
        }*/
        localStorage.setItem(CUSTOM_ACCENTS_KEY, JSON.stringify(NEW_CUSTOM_ACCENTS_ARRAY.filter((child) => child.name !== name)))
        //alert("Deleted accent: " + name);
    }

    function test() {
        setCustomAccentComponents((prev) => {console.log(prev); return prev});
    }
    function reloadComponents(newData) {
        setCustomAccentComponents([])

        newData.forEach((item) => {
            addToUI(
                <CustomAccentComponent
                    //name={`*Name ${this.accents}*`}
                    name={item.name}
                    //primaryColor={"#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}
                    primaryColor={item.colors.primary}
                    primaryColorDark={item.colors.primaryDark}
                    onEditClicked={props.onEditClicked}
                    onDeleteClicked={(name) => {
                        props.onDeleteClicked(name, deleteAccentComponentFromUIwithName);
                    }}
                    onActivated={props.onActivated}
                    onDeactivated={props.onDeactivated}
                    refreshUI={refreshUI}
                />
            )
        })
    }

    const CUSTOM_ACCENTS_ARRAY = JSON.parse(localStorage.getItem(CUSTOM_ACCENTS_KEY)) == 1 ? [] : JSON.parse(localStorage.getItem(CUSTOM_ACCENTS_KEY))
    
    if (!hasAccentsBeenRendered) {
        setTimeout(() => {
            for (const accentData of (CUSTOM_ACCENTS_ARRAY == [] ? [{ nothing: true }] : CUSTOM_ACCENTS_ARRAY)) {
                if (accentData.nothing) continue;
                if (accentData.name && accentData.colors.primary) {
                    addToUI(
                        <CustomAccentComponent
                            name={accentData.name}
                            primaryColor={accentData.colors.primary}
                            primaryColorDark={accentData.colors.primaryDark}
                            onEditClicked={props.onEditClicked}
                            onDeleteClicked={(name) => {
                                props.onDeleteClicked(name, deleteAccentComponentFromUIwithName);
                            }}
                            onActivated={props.onActivated}
                            onDeactivated={props.onDeactivated}
                            refreshUI={refreshUI}
                        />
                    )
                    //await new Promise(r => setTimeout(r, 1000))
                }
            }
        }, 500)
        setHasAccentsBeenRendered(true)
    }

    /*props.onCreateAccentClicked(refreshUI, CustomAccentComponent, addToUI, deleteAccentComponentFromUIwithName)*/

    return (
        <Modal
            className={styles.modalContent}
            onRequestClose={(...args) => {
                props.onClose(...args)
            }}
            contentLabel={props.intl.formatMessage(messages.title)}
            id="customAccentModal"
        >
            {!isNewAccUIOpen && (
                <Box className={styles.body}>
                    <Header>
                        This is still in beta development as there may be bugs that can cause the editor to break
                    </Header>
                    <div
                        className={styles.buttonStretchy}
                        onClick={() => {setIsNewAccUIOpen(true); console.log("create new accent button opened")}}
                    >
                        Create new Accent
                    </div>
                    <Header>
                        Saved Accents:
                    </Header>
                    <Gap
                        height="18px"
                    />
                    <div>{customAccentComponents}</div>
                    {customAccentComponents.length === 0 && <div className={styles.nothingText}>
                        You currently have no saved accents.
                    </div>}
                    {/*<CustomAccentComponent
                        name="*Name* (Accent 1)"
                        primaryColor="#757575"
                        onEditClicked={props.onEditClicked}
                        onDeleteClicked={props.onDeleteClicked}
                    />
                    <CustomAccentComponent
                        name="*Name* (Accent 2)"
                        primaryColor="#83da65"
                        onEditClicked={props.onEditClicked}
                        onDeleteClicked={props.onDeleteClicked}
                    />*/}
                    {isUnsupported() ? (
                        <div className={styles.nothingText}>
                            Your browser does not support the 'showOpenFilePicker' function, which is required to import Accents.
                        </div>
                    ) : (
                            <div
                                style={{
                                    display: "flex",
                                    gap: "8px"
                                }}
                            >
                                <button
                                    onClick={props.onExportAccents}
                                    className={styles.button}
                                >
                                    <FormattedMessage
                                        defaultMessage="Export Accents"
                                        description="Button in custom accents modal"
                                        id="dm.customAccentsModal.exportAccents"
                                    />
                                </button>
                                <button
                                    onClick={() => {props.onImportAccents(reloadComponents)}}
                                    className={styles.button}
                                >
                                    <FormattedMessage
                                        defaultMessage="Import Accents"
                                        description="Button in custom accents modal"
                                        id="dm.customAccentsModal.importAccents"
                                    />
                                </button>
                            </div>
                        )
                    }
                </Box>
            )}
            {!!isNewAccUIOpen && (
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        
                        const form = e.target;
                        const formData = new FormData(form);
                        const formJson = Object.fromEntries(formData.entries());

                        setIsNewAccUIOpen(false);

                        props.onCreateAccentClicked(refreshUI, CustomAccentComponent, addToUI, deleteAccentComponentFromUIwithName, {
                            name: formJson.nameInput,
                            primaryColor: formJson.colorInput,
                            primaryColorDark: formJson.colorInput2
                        })
                    }}
                >
                    <Box className={styles.body}>
                        {/*<Header>
                            There's nothing here yet.
                        </Header>
                        <div
                            className={styles.buttonStretchy}
                            onClick={() => {setIsNewAccUIOpen(false)}}
                        >
                            Click here to go back
                        </div>*/}
                        <Header>
                            Name:
                        </Header>
                        <input
                            type={"text"}
                            className={styles.inputStretchy}
                            name={"nameInput"}
                        />
                        <Header>
                            Primary Color:
                        </Header>
                        <input
                            type={"color"}
                            name={"colorInput"}
                            className={styles.accentIconOuter}
                        />
                        <Header>
                            Primary Color (Dark Mode):
                        </Header>
                        <input
                            type={"color"}
                            name={"colorInput2"}
                            className={styles.accentIconOuter}
                        />
                    </Box>
                    <Box className={classNames(styles.buttonRow, styles.buttonsBackground)}>
                        <button
                            className={styles.cancelButton}
                            onClick={() => {setIsNewAccUIOpen(false)}}
                        >
                            <FormattedMessage
                                defaultMessage="Cancel"
                                description="Label for button to cancel custom procedure edits"
                                id="gui.customProcedures.cancel"
                            />
                        </button>
                        <button
                            className={styles.okButton}
                            type={"submit"}
                        >
                            <FormattedMessage
                                defaultMessage="OK"
                                description="Label for button to save new custom procedure"
                                id="gui.customProcedures.ok"
                            />
                        </button>
                    </Box>
                </form>
            )}
        </Modal>
    )
}

CustomAccentModalComponent.propTypes = {
    intl: intlShape,
    onClose: PropTypes.func,
    onEditClicked: PropTypes.func.isRequired,
    onDeleteClicked: PropTypes.func.isRequired,
    onCreateAccentClicked: PropTypes.func.isRequired,
    onActivated: PropTypes.func.isRequired,
    onDeactivated: PropTypes.func.isRequired,
    onExportAccents: PropTypes.func.isRequired,
    onImportAccents: PropTypes.func.isRequired,
};

export default injectIntl(CustomAccentModalComponent)