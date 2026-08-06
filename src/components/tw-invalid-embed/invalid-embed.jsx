import React from 'react';
import styles from './invalid-embed.css';
import {APP_NAME} from '../../lib/brand';

// Note that when this component is used, the rest of scratch-gui is not being run, so don't
// use redux, themes, translations, etc.

// We also can't be certain that the iframe sandbox will let us open up links, so make sure
// all the links can be manually visited if necessary.

const InvalidEmbed = () => {
    // We don't have server related stuff yet
    const root = process.env.ROOT || '/';
    const embedUrl = `${location.origin}${root}embed.html#<project ID>`;
    const exampleUrl = `${location.origin}${root}embed.html#60917032`;

    return (
        <div className={styles.container}>
            <h1>{`Invalid ${APP_NAME} Embed :(`}</h1>
            <p>
                {'See '}
                <a
                    href="https://docs.nitrobolt.org/website/embedding"
                    target="_blank"
                    rel="noreferrer"
                >
                    {'docs.nitrobolt.org/website/embedding'}
                </a>
                {/* eslint-disable-next-line max-len */}
                {' for more information. You need to replace the iframe src with the embed page:'}
            </p>
            <p className={styles.code}>
                {embedUrl}
            </p>
            <p>
                {'Here\'s an example of a full iframe to embed a project:'}
            </p>
            <p className={styles.code}>
                {/* eslint-disable-next-line max-len */}
                {`<iframe src="${exampleUrl}" width="482" height="412" allowtransparency="true" frameborder="0" scrolling="no" allowfullscreen></iframe>`}
            </p>
            <p>
                {'If you are seeing this page even though you aren\'t embedding anything, let us know on '}
                <a
                    href="https://scratch.mit.edu/users/CubesterYT/#comments"
                    target="_blank"
                    rel="noreferrer"
                >
                    {'scratch.mit.edu/users/CubesterYT'}
                </a>
                {'.'}
            </p>
        </div>
    );
};

export default InvalidEmbed;
