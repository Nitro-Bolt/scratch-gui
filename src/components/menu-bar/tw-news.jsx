import React from 'react';
import {APP_NAME} from '../../lib/brand';
import {isScratchDesktop} from '../../lib/isScratchDesktop';
import CloseButton from '../close-button/close-button.jsx';
import styles from './tw-news.css';

const LOCAL_STORAGE_KEY = 'tw:closedNews';
const NEWS_ID = 'android-fraud';

const newsAppliesToUser = () => /android/i.test(navigator.userAgent);

const NewsBody = () => (
    <div className={styles.text}>
        {/* eslint-disable-next-line max-len */}
        {`The Google Play Store app calling itself TurboWarp is illegitimate and outdated. If you were misled into installing it, leave a 1 star review, uninstall it, and report it. An official one will exist eventually.`}
    </div>
);

const getIsClosedInLocalStorage = () => {
    try {
        return localStorage.getItem(LOCAL_STORAGE_KEY) === NEWS_ID;
    } catch (e) {
        return false;
    }
};

const markAsClosedInLocalStorage = () => {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, NEWS_ID);
    } catch (e) {
        // ignore
    }
};

class TWNews extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            closed: getIsClosedInLocalStorage() || !newsAppliesToUser()
        };
        this.handleClose = this.handleClose.bind(this);
    }
    handleClose () {
        markAsClosedInLocalStorage();
        this.setState({
            closed: true
        }, () => {
            window.dispatchEvent(new Event('resize'));
        });
    }
    render () {
        if (this.state.closed || isScratchDesktop()) {
            return null;
        }
        return (
            <div className={styles.news}>
                <NewsBody />
                <CloseButton
                    className={styles.close}
                    onClick={this.handleClose}
                />
            </div>
        );
    }
}

export default TWNews;
