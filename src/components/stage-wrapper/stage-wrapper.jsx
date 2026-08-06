import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import VM from 'scratch-vm';

import Box from '../box/box.jsx';
import StageHeader from '../../containers/stage-header.jsx';
import Stage from '../../containers/stage.jsx';
import Loader from '../loader/loader.jsx';

import styles from './stage-wrapper.css';

const StageWrapperComponent = function (props) {
    const {
        isEmbedded,
        isPlayerOnly,
        isFullScreen,
        isRtl,
        isRendererSupported,
        loading,
        stageSize,
        setStageSize,
        preferences,
        vm
    } = props;

    return (
        <Box
            className={classNames(
                styles.stageWrapper,
                {
                    [styles.embedded]: isEmbedded,
                    [styles.fullScreen]: isFullScreen,
                    [styles.loading]: loading,
                    [styles.offsetControls]: !(isEmbedded || isFullScreen)
                }
            )}
            dir={isRtl ? 'rtl' : 'ltr'}
        >
            <Box className={classNames(styles.stageMenuWrapper, stageSize === 0 ? styles.stageHidden : null)}>
                <StageHeader
                    isPlayerOnly={isPlayerOnly}
                    isRtl={isRtl}
                    stageSize={stageSize}
                    setStageSize={setStageSize}
                    vm={vm}
                />
            </Box>
            <Box
                className={classNames(
                    styles.stageCanvasWrapper,
                    {
                        [styles.hidden]: stageSize === 0 && !(isEmbedded || isFullScreen) ? 'hidden' : null
                    }
                )}
            >
                {
                    isRendererSupported ?
                        <Stage
                            isPlayerOnly={isPlayerOnly}
                            stageSize={stageSize}
                            preferences={preferences}
                            vm={vm}
                        /> :
                        null
                }
            </Box>
            {loading ? (
                <Loader isFullScreen={isFullScreen} />
            ) : null}
        </Box>
    );
};

StageWrapperComponent.propTypes = {
    isEmbedded: PropTypes.bool,
    isPlayerOnly: PropTypes.bool,
    isFullScreen: PropTypes.bool,
    isRendererSupported: PropTypes.bool.isRequired,
    isRtl: PropTypes.bool.isRequired,
    loading: PropTypes.bool,
    stageSize: PropTypes.number.isRequired,
    setStageSize: PropTypes.func.isRequired,
    preferences: PropTypes.object.isRequired,
    vm: PropTypes.instanceOf(VM).isRequired
};

export default StageWrapperComponent;
