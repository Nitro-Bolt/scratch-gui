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

/* eslint-disable react/no-multi-comp */

const BufferedInput = BufferedInputHOC(Input);

const messages = defineMessages({
    title: {
        defaultMessage: 'Custom Accents',
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

const CustomAccentComponent = props => (
    <div
        className={styles.divStretchy}
        style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
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
            <div
                className={classNames(styles.iconButton)}
                type={"edit"}
                onClick={() => props.onEditClicked(props.name)}
            >
                <img
                    src={editIcon}
                    draggable={"false"}
                />
            </div>
            <div
                className={classNames(styles.iconButton)}
                type={"delete"}
                onClick={() => props.onDeleteClicked(props.name)}
            >
                <img
                    src={deleteIcon}
                    draggable={"false"}
                />
            </div>
        </div>
    </div>
)

CustomAccentComponent.propTypes = {
    name: PropTypes.string,
    primaryColor: PropTypes.string,
    onEditClicked: PropTypes.func.isRequired,
    onDeleteClicked: PropTypes.func.isRequired,
};

const CustomAccentModalComponent = function (props) {
    const [customAccentComponents, setCustomAccentComponents] = useState([]);

    function refreshUI() {
        setCustomAccentComponents((prev) => [...prev]);
    }

    function addToUI(node) {
        setCustomAccentComponents((prev) => [...prev, node]);
    }

    function deleteAccentComponentFromUIwithName(name) {
        setCustomAccentComponents((prev) =>
            prev.filter((child) => child.props.name !== name)
        );
        //alert("Deleted accent: " + name);
    }

    let isNewAccUIOpen = false

    return (
            <Modal
                className={styles.modalContent}
                onRequestClose={(...args) => {
                    props.onClose(...args)
                }}
                contentLabel={props.intl.formatMessage(messages.title)}
                id="customAccentModal"
            >
                <Box className={styles.body}>
                    {!isNewAccUIOpen && (
                        <>
                            <Header>
                                Custom Accents (This is currently unfinished and being worked on.)
                            </Header>
                            <div
                                className={styles.buttonStretchy}
                                onClick={() => {isNewAccUIOpen = true; refreshUI()/*props.onCreateAccentClicked(refreshUI, CustomAccentComponent, addToUI, deleteAccentComponentFromUIwithName)*/}}
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
                        </>
                    )}
                    {!!isNewAccUIOpen && (
                        <>
                            <Header>
                                There's nothing here yet.
                            </Header>
                            <div
                                className={styles.buttonStretchy}
                                onClick={() => {isNewAccUIOpen = false; refreshUI()}}
                            >
                                Click here to go back
                            </div>
                        </>
                    )}
                </Box>
            </Modal>
    )
}

CustomAccentModalComponent.propTypes = {
    intl: intlShape,
    onClose: PropTypes.func,
    onEditClicked: PropTypes.func.isRequired,
    onDeleteClicked: PropTypes.func.isRequired,
    onCreateAccentClicked: PropTypes.func.isRequired,
};

export default injectIntl(CustomAccentModalComponent)