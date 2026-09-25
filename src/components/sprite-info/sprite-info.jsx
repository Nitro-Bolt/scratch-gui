import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import Box from '../box/box.jsx';
import Label from '../forms/label.jsx';
import Input from '../forms/input.jsx';
import BufferedInputHOC from '../forms/buffered-input-hoc.jsx';
import DirectionPicker from '../../containers/direction-picker.jsx';

import {injectIntl, intlShape, defineMessages, FormattedMessage} from 'react-intl';

import {isWideLocale} from '../../lib/locale-utils.js';

import styles from './sprite-info.css';

import xIcon from './icon--x.svg';
import yIcon from './icon--y.svg';
import showIcon from '!../../lib/tw-recolor/build!./icon--show.svg';
import hideIcon from '!../../lib/tw-recolor/build!./icon--hide.svg';
import ToggleButtons from '../toggle-buttons/toggle-buttons.jsx';
import collapseIcon from './icon--collapse.svg';

const BufferedInput = BufferedInputHOC(Input);

const messages = defineMessages({
    spritePlaceholder: {
        id: 'gui.SpriteInfo.spritePlaceholder',
        defaultMessage: 'Name',
        description: 'Placeholder text for sprite name'
    },
    showSpriteAction: {
        id: 'gui.SpriteInfo.showSpriteAction',
        defaultMessage: 'Show sprite',
        description: 'Tooltip for show sprite button'
    },
    hideSpriteAction: {
        id: 'gui.SpriteInfo.hideSpriteAction',
        defaultMessage: 'Hide sprite',
        description: 'Tooltip for hide sprite button'
    },
    collapseSpriteProperties: {
        id: 'gui.SpriteInfo.collapseSpriteProperties',
        defaultMessage: 'Collapse sprite properties',
        description: 'Tooltip for collapsing the sprite properties panel'
    },
    expandSpriteProperties: {
        id: 'gui.SpriteInfo.expandSpriteProperties',
        defaultMessage: 'Expand sprite properties',
        description: 'Tooltip for expanding the sprite properties panel'
    },
    collapseCameraProperties: {
        id: 'gui.SpriteInfo.collapseCameraProperties',
        defaultMessage: 'Collapse camera properties',
        description: 'Tooltip for collapsing the camera properties panel'
    },
    expandCameraProperties: {
        id: 'gui.SpriteInfo.expandCameraProperties',
        defaultMessage: 'Expand camera properties',
        description: 'Tooltip for expanding the camera properties panel'
    }
});

class SpriteInfo extends React.Component {
    shouldComponentUpdate (nextProps) {
        return (
            this.props.cameraPropertiesCollapsed !== nextProps.cameraPropertiesCollapsed ||
            this.props.spritePropertiesCollapsed !== nextProps.spritePropertiesCollapsed ||
            this.props.rotationStyle !== nextProps.rotationStyle ||
            this.props.disabled !== nextProps.disabled ||
            this.props.cameraExtensionLoaded !== nextProps.cameraExtensionLoaded ||
            (this.props.camera && this.props.camera.name) !== (nextProps.camera && nextProps.camera.name) ||
            (this.props.camera && this.props.camera.x) !== (nextProps.camera && nextProps.camera.x) ||
            (this.props.camera && this.props.camera.y) !== (nextProps.camera && nextProps.camera.y) ||
            (this.props.camera && this.props.camera.zoom) !== (nextProps.camera && nextProps.camera.zoom) ||
            (this.props.camera && this.props.camera.direction) !== (nextProps.camera && nextProps.camera.direction) ||
            this.props.name !== nextProps.name ||
            this.props.stageSize !== nextProps.stageSize ||
            this.props.visible !== nextProps.visible ||
            // Only update these if rounded value has changed
            Math.round(this.props.direction) !== Math.round(nextProps.direction) ||
            Math.round(this.props.size) !== Math.round(nextProps.size) ||
            Math.round(this.props.x) !== Math.round(nextProps.x) ||
            Math.round(this.props.y) !== Math.round(nextProps.y)
        );
    }
    render () {
        const {
            stageSize
        } = this.props;

        const smallThreshold = 430;

        const sprite = (
            <FormattedMessage
                defaultMessage="Sprite"
                description="Sprite info label"
                id="gui.SpriteInfo.sprite"
            />
        );
        const showLabel = (
            <FormattedMessage
                defaultMessage="Show"
                description="Sprite info show label"
                id="gui.SpriteInfo.show"
            />
        );
        const sizeLabel = (
            <FormattedMessage
                defaultMessage="Size"
                description="Sprite info size label"
                id="gui.SpriteInfo.size"
            />
        );
        const cameraLabel = (
            <FormattedMessage
                defaultMessage="Camera"
                description="Sprite info bound camera label"
                id="gui.SpriteInfo.camera"
            />
        );
        const zoomLabel = (
            <FormattedMessage
                defaultMessage="Zoom"
                description="Sprite info camera zoom label"
                id="gui.SpriteInfo.cameraZoom"
            />
        );
        const directionLabel = (
            <FormattedMessage
                defaultMessage="Direction"
                description="Sprite info camera direction label"
                id="gui.SpriteInfo.cameraDirection"
            />
        );

        const labelAbove = isWideLocale(this.props.intl.locale);

        const spriteNameInput = (
            <BufferedInput
                className={classNames(
                    styles.spriteInput,
                    {
                        [styles.columnInput]: labelAbove
                    }
                )}
                disabled={this.props.disabled}
                placeholder={this.props.intl.formatMessage(messages.spritePlaceholder)}
                tabIndex="0"
                type="text"
                value={this.props.disabled ? '' : this.props.name}
                onSubmit={this.props.onChangeName}
            />
        );

        const xPosition = (
            <div className={styles.group}>
                {
                    (stageSize > smallThreshold) ?
                        <div className={styles.iconWrapper}>
                            <img
                                aria-hidden="true"
                                className={classNames(styles.xIcon, styles.icon)}
                                src={xIcon}
                                draggable={false}
                            />
                        </div> :
                        null
                }
                <Label text="x">
                    <BufferedInput
                        small
                        disabled={this.props.disabled}
                        placeholder="x"
                        tabIndex="0"
                        type="number"
                        value={this.props.disabled ? '' : Math.round(this.props.x)}
                        onSubmit={this.props.onChangeX}
                    />
                </Label>
            </div>
        );

        const yPosition = (
            <div className={styles.group}>
                {
                    (stageSize > smallThreshold) ?
                        <div className={styles.iconWrapper}>
                            <img
                                aria-hidden="true"
                                className={classNames(styles.yIcon, styles.icon)}
                                src={yIcon}
                                draggable={false}
                            />
                        </div> :
                        null
                }
                <Label text="y">
                    <BufferedInput
                        small
                        disabled={this.props.disabled}
                        placeholder="y"
                        tabIndex="0"
                        type="number"
                        value={this.props.disabled ? '' : Math.round(this.props.y)}
                        onSubmit={this.props.onChangeY}
                    />
                </Label>
            </div>
        );

        const visibility = (
            <ToggleButtons
                buttons={[
                    {
                        handleClick: this.props.onClickVisible,
                        icon: showIcon,
                        isSelected: this.props.visible && !this.props.disabled,
                        title: this.props.intl.formatMessage(messages.showSpriteAction)
                    },
                    {
                        handleClick: this.props.onClickNotVisible,
                        icon: hideIcon,
                        isSelected: !this.props.visible && !this.props.disabled,
                        title: this.props.intl.formatMessage(messages.hideSpriteAction)
                    }
                ]}
                disabled={this.props.disabled}
            />
        );

        const size = (
            <div className={classNames(styles.group, styles.largerInput)}>
                <Label
                    secondary
                    above={labelAbove}
                    text={sizeLabel}
                >
                    <BufferedInput
                        small
                        disabled={this.props.disabled}
                        label={sizeLabel}
                        tabIndex="0"
                        type="number"
                        value={this.props.disabled ? '' : Math.round(this.props.size)}
                        onSubmit={this.props.onChangeSize}
                    />
                </Label>
            </div>
        );

        const direction = (
            <div className={classNames(styles.group, styles.largerInput)}>
                <DirectionPicker
                    direction={Math.round(this.props.direction)}
                    disabled={this.props.disabled}
                    labelAbove={labelAbove}
                    rotationStyle={this.props.rotationStyle}
                    onChangeDirection={this.props.onChangeDirection}
                    onChangeRotationStyle={this.props.onChangeRotationStyle}
                />
            </div>
        );

        const camera = this.props.camera;
        const formatCameraNumber = value => Math.round(Number(value) * 100) / 100;
        const cameraPosition = (axis, icon, value) => (
            <div className={styles.group}>
                <div className={styles.iconWrapper}>
                    <img
                        aria-hidden="true"
                        className={classNames(styles[`${axis}Icon`], styles.icon)}
                        src={icon}
                        draggable={false}
                    />
                </div>
                <Label text={axis}>
                    <Input
                        small
                        readOnly
                        tabIndex="-1"
                        type="number"
                        value={formatCameraNumber(value)}
                    />
                </Label>
            </div>
        );
        const cameraInfo = this.props.cameraExtensionLoaded && !this.props.disabled ? (
            <div className={styles.cameraInfo}>
                <div className={classNames(styles.row, styles.rowPrimary)}>
                    <div className={classNames(styles.group, styles.cameraName)}>
                        <Label text={cameraLabel}>
                            <Input
                                readOnly
                                className={styles.cameraNameInput}
                                tabIndex="-1"
                                type="text"
                                value={camera.name}
                            />
                        </Label>
                    </div>
                    {cameraPosition('x', xIcon, camera.x)}
                    {cameraPosition('y', yIcon, camera.y)}
                </div>
                <div className={classNames(styles.row, styles.cameraSecondary)}>
                    <div className={classNames(styles.group, styles.largerInput)}>
                        <Label
                            secondary
                            text={zoomLabel}
                        >
                            <Input
                                small
                                readOnly
                                tabIndex="-1"
                                type="number"
                                value={formatCameraNumber(camera.zoom)}
                            />
                        </Label>
                    </div>
                    <div className={classNames(styles.group, styles.largerInput)}>
                        <Label
                            secondary
                            text={directionLabel}
                        >
                            <Input
                                small
                                readOnly
                                tabIndex="-1"
                                type="number"
                                value={formatCameraNumber(camera.direction)}
                            />
                        </Label>
                    </div>
                </div>
            </div>
        ) : null;

        let spriteInfo;
        if (stageSize <= smallThreshold && stageSize > smallThreshold - 100) {
            spriteInfo = (
                <React.Fragment>
                    <div
                        className={classNames(styles.row, styles.rowPrimary, styles.rowSmall)}
                    >
                        <div
                            className={styles.group}
                            style={{
                                flexGrow: 1
                            }}
                        >
                            {spriteNameInput}
                        </div>
                        {xPosition}
                    </div>
                    <div className={classNames(styles.row, styles.rowSecondary)}>
                        {visibility}
                        {size}
                        {yPosition}
                    </div>
                </React.Fragment>
            );
        } else if (stageSize <= smallThreshold) {
            spriteInfo = (
                <React.Fragment>
                    <div className={classNames(styles.row, styles.rowPrimary)}>
                        <div
                            className={styles.group}
                            style={{
                                flexGrow: 1
                            }}
                        >
                            {spriteNameInput}
                        </div>
                    </div>
                    <div className={classNames(styles.row, styles.rowSecondary)}>
                        {stageSize > smallThreshold - 100 && visibility}
                        {xPosition}
                        {yPosition}
                    </div>
                </React.Fragment>
            );
        } else {
            spriteInfo = (
                <React.Fragment>
                    <div className={classNames(styles.row, styles.rowPrimary)}>
                        <div
                            className={styles.group}
                            style={{
                                flexGrow: 1
                            }}
                        >
                            <Label
                                above={labelAbove}
                                text={sprite}
                            >
                                {spriteNameInput}
                            </Label>
                        </div>
                        {xPosition}
                        {yPosition}
                    </div>
                    <div className={classNames(styles.row, styles.rowSecondary)}>
                        <div className={labelAbove ? styles.column : styles.group}>
                            {
                                stageSize > smallThreshold ?
                                    <Label
                                        secondary
                                        text={showLabel}
                                    /> :
                                    null
                            }
                            {visibility}
                        </div>
                        {size}
                        {direction}
                    </div>
                </React.Fragment>
            );
        }

        const collapseButton = (collapsed, onClick, collapseMessage, expandMessage) => (
            <button
                aria-expanded={!collapsed}
                className={styles.collapseButton}
                title={this.props.intl.formatMessage(collapsed ? expandMessage : collapseMessage)}
                type="button"
                onClick={onClick}
            >
                <img
                    className={classNames(styles.collapseIcon, {
                        [styles.collapseIconCollapsed]: collapsed
                    })}
                    draggable={false}
                    src={collapseIcon}
                />
            </button>
        );

        return (
            <Box className={styles.spriteInfo}>
                <div className={styles.propertiesPanel}>
                    <div
                        className={classNames(styles.collapsibleContent, {
                            [styles.collapsibleContentCollapsed]: this.props.spritePropertiesCollapsed
                        })}
                    >
                        <div className={styles.collapsibleContentInner}>
                            <div className={styles.propertiesContent}>
                                {spriteInfo}
                            </div>
                        </div>
                    </div>
                    {collapseButton(
                        this.props.spritePropertiesCollapsed,
                        this.props.onToggleSpriteProperties,
                        messages.collapseSpriteProperties,
                        messages.expandSpriteProperties
                    )}
                </div>
                {cameraInfo && (
                    <div className={styles.cameraPanel}>
                        <div
                            className={classNames(styles.collapsibleContent, {
                                [styles.collapsibleContentCollapsed]: this.props.cameraPropertiesCollapsed
                            })}
                        >
                            <div className={styles.collapsibleContentInner}>
                                <div className={styles.cameraContent}>
                                    {cameraInfo}
                                </div>
                            </div>
                        </div>
                        {collapseButton(
                            this.props.cameraPropertiesCollapsed,
                            this.props.onToggleCameraProperties,
                            messages.collapseCameraProperties,
                            messages.expandCameraProperties
                        )}
                    </div>
                )}
            </Box>
        );
    }
}

SpriteInfo.propTypes = {
    camera: PropTypes.shape({
        direction: PropTypes.number,
        name: PropTypes.string,
        x: PropTypes.number,
        y: PropTypes.number,
        zoom: PropTypes.number
    }),
    cameraExtensionLoaded: PropTypes.bool,
    cameraPropertiesCollapsed: PropTypes.bool.isRequired,
    direction: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ]),
    disabled: PropTypes.bool,
    intl: intlShape,
    name: PropTypes.string,
    onChangeDirection: PropTypes.func,
    onChangeName: PropTypes.func,
    onChangeRotationStyle: PropTypes.func,
    onChangeSize: PropTypes.func,
    onChangeX: PropTypes.func,
    onChangeY: PropTypes.func,
    onClickNotVisible: PropTypes.func,
    onClickVisible: PropTypes.func,
    onToggleCameraProperties: PropTypes.func.isRequired,
    onToggleSpriteProperties: PropTypes.func.isRequired,
    rotationStyle: PropTypes.string,
    size: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ]),
    spritePropertiesCollapsed: PropTypes.bool.isRequired,
    stageSize: PropTypes.number.isRequired,
    visible: PropTypes.bool,
    x: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ]),
    y: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number
    ])
};

export default injectIntl(SpriteInfo);
