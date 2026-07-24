import React from 'react';
import PropTypes from 'prop-types';
import {base64ToArrayBuffer} from '../../lib/tw-base64-utils';
import styles from './data-url.css';

/**
 * @param {string} dataURI data: URI
 * @returns {string} A hopefully human-readable version
 */
const decodeDataURI = dataURI => {
    const delimeter = dataURI.indexOf(',');
    if (delimeter === -1) {
        return dataURI;
    }
    const contentType = dataURI.substring(0, delimeter);
    const data = dataURI.substring(delimeter + 1);
    if (contentType.endsWith(';base64')) {
        try {
            // A direct atob() mishandles international characters
            // https://github.com/TurboWarp/scratch-gui/issues/1151
            return new TextDecoder().decode(base64ToArrayBuffer(data));
        } catch (e) {
            return dataURI;
        }
    }
    try {
        return decodeURIComponent(data);
    } catch (e) {
        return dataURI;
    }
};

const DataURL = props => (
    <textarea
        className={styles.code}
        value={decodeDataURI(props.url)}
        readOnly
        spellCheck={false}
        autoComplete="off"
    />
);

DataURL.propTypes = {
    url: PropTypes.string.isRequired
};

export default DataURL;
