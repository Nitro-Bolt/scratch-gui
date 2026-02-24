import React from 'react';
import PropTypes from 'prop-types';
import {defineMessages, FormattedMessage, injectIntl, intlShape} from 'react-intl';

import BufferedInputHOC from '../forms/buffered-input-hoc.jsx';
import Label from '../forms/label.jsx';
import Input from '../forms/input.jsx';

import styles from './asset-viewer.css';

const BufferedInput = BufferedInputHOC(Input);

const messages = defineMessages({
    asset: {
        id: 'gui.assetViewer.asset',
        description: 'Label for the name of the asset',
        defaultMessage: 'Asset'
    },
    lastModifiedDate: {
        id: 'gui.assetViewer.lastModifiedDate',
        description: 'Label for the last modification date of the asset',
        defaultMessage: 'Last Modified'
    },
    size: {
        id: 'gui.assetViewer.size',
        description: 'Label for the size of the asset',
        defaultMessage: 'Size'
    }
});

const AssetViewerComponent = props => (
    <div className={styles.viewerContainer}>
        
            {props.blobURL && props.contentType ? (
                props.contentType.startsWith('video/') ? (
                    <video className={styles.mediaPreview} src={props.blobURL} controls />
                ) : props.contentType.startsWith('audio/') ? (
                    <audio className={styles.mediaPreview} src={props.blobURL} controls />
                ) : props.contentType.startsWith('image/') ? (
                    <img className={styles.mediaPreview} src={props.blobURL} draggable={false} />
                ) : null
            ) : (
                <img
                    className={styles.icon}
                    draggable={false}
                    src={props.imageURL}
                />
            )}
            <div className={styles.attribute}>
                <Label text={props.intl.formatMessage(messages.asset)}>
                    <BufferedInput
                        tabIndex="1"
                        type="text"
                        value={props.name}
                        onSubmit={props.onChangeName}
                    />
                </Label>
            </div>
            <div className={styles.attribute}>
                <Label text={props.intl.formatMessage(messages.lastModifiedDate)}>
                    <Label secondary text={props.lastModified} />
                </Label>
            </div>
            <div className={styles.attribute}>
                <Label text={props.intl.formatMessage(messages.size)}>
                    <Label secondary text={props.size} />
                </Label>
            </div>
    </div>
);

AssetViewerComponent.propTypes = {
    name: PropTypes.string.isRequired,
    lastModified: PropTypes.string.isRequired,
    size: PropTypes.string.isRequired,
    blobURL: PropTypes.any,
    contentType: PropTypes.any,
    imageURL: PropTypes.string.isRequired,
    intl: intlShape
};

export default injectIntl(AssetViewerComponent);