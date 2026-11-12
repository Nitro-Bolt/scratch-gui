import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, {useEffect, useRef} from 'react';
import ReactModal from 'react-modal';
import {FormattedMessage} from 'react-intl';
import {GUI_DARK} from '../../lib/themes/index.js';

import Box from '../box/box.jsx';
import Button from '../button/button.jsx';
import CloseButton from '../close-button/close-button.jsx';

import backIcon from '../../lib/assets/icon--back.svg';
import helpIcon from '../../lib/assets/icon--help.svg';

import styles from './modal.css';

const ModalComponent = props => {
    const contentElement = useRef(null);
    const animationEndHandler = useRef(null);
    const hasFinishedOpening = useRef(false);
    const finishOpening = () => {
        if (hasFinishedOpening.current) return;
        hasFinishedOpening.current = true;
        if (props.onOpenAnimationEnd) props.onOpenAnimationEnd();
    };
    const setContentElement = element => {
        if (contentElement.current && animationEndHandler.current) {
            contentElement.current.removeEventListener('animationend', animationEndHandler.current);
        }
        contentElement.current = element;
        if (element && props.preferences['modal-open-animation']) {
            animationEndHandler.current = event => {
                if (event.target === element) finishOpening();
            };
            element.addEventListener('animationend', animationEndHandler.current);
        }
    };
    useEffect(() => {
        if (!props.preferences['modal-open-animation']) {
            finishOpening();
        }
        return () => {
            if (contentElement.current && animationEndHandler.current) {
                contentElement.current.removeEventListener('animationend', animationEndHandler.current);
            }
        };
    }, []);

    const blur = Number(props.preferences['modal-overlay-blur'] ?? 0);

    return (<ReactModal
        isOpen
        className={classNames(styles.modalContent, props.className, {
            [styles.fullScreen]: props.fullScreen,
            [styles.modern]: !props.preferences['legacy-modals'],
            [props.modernClassName]: !props.preferences['legacy-modals'],
            [styles.openAnimation]: props.preferences['modal-open-animation'],
            [styles.dark]: props.theme.gui === GUI_DARK
        })}
        style={{
            overlay: blur > 0 ? {
                backdropFilter: `blur(${blur}px)`
            } : {}
        }}
        contentLabel={props.contentLabel}
        // This ref must update the hook-owned content element.
        // eslint-disable-next-line react/jsx-no-bind
        contentRef={setContentElement}
        overlayClassName={styles.modalOverlay}
        onRequestClose={props.onRequestClose}
    >
        <Box
            dir={props.isRtl ? 'rtl' : 'ltr'}
            direction="column"
            grow={1}
        >
            <div className={classNames(styles.header, props.headerClassName)}>
                {props.onHelp ? (
                    <div
                        className={classNames(
                            styles.headerItem,
                            styles.headerItemHelp
                        )}
                    >
                        <Button
                            className={styles.helpButton}
                            iconSrc={helpIcon}
                            onClick={props.onHelp}
                        >
                            <FormattedMessage
                                defaultMessage="Help"
                                description="Help button in modal"
                                id="gui.modal.help"
                            />
                        </Button>
                    </div>
                ) : null}
                <div
                    className={classNames(
                        styles.headerItem,
                        styles.headerItemTitle
                    )}
                >
                    {props.headerImage ? (
                        <img
                            className={styles.headerImage}
                            src={props.headerImage}
                            draggable={false}
                        />
                    ) : null}
                    {props.contentLabel}
                </div>
                <div
                    className={classNames(
                        styles.headerItem,
                        styles.headerItemClose
                    )}
                >
                    {props.fullScreen ? (
                        <Button
                            className={styles.backButton}
                            iconSrc={backIcon}
                            onClick={props.onRequestClose}
                        >
                            <FormattedMessage
                                defaultMessage="Back"
                                description="Back button in modal"
                                id="gui.modal.back"
                            />
                        </Button>
                    ) : (
                        <CloseButton
                            size={CloseButton.SIZE_LARGE}
                            onClick={props.onRequestClose}
                        />
                    )}
                </div>
            </div>
            {props.children}
        </Box>
    </ReactModal>);
};

ModalComponent.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    contentLabel: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object
    ]).isRequired,
    fullScreen: PropTypes.bool,
    headerClassName: PropTypes.string,
    headerImage: PropTypes.string,
    isRtl: PropTypes.bool,
    onHelp: PropTypes.func,
    onOpenAnimationEnd: PropTypes.func,
    onRequestClose: PropTypes.func,
    modernClassName: PropTypes.string,
    preferences: PropTypes.object,
    theme: PropTypes.object
};

export default ModalComponent;
