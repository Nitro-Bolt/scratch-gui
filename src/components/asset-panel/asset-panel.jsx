import React from 'react';
import PropTypes from 'prop-types';
/* eslint-disable react/jsx-no-bind */

import Box from '../box/box.jsx';
import FancyCheckbox from '../tw-fancy-checkbox/checkbox.jsx';
import Selector from './selector.jsx';
import styles from './asset-panel.css';

const AssetPanel = props => {
    const stopEditorEvent = event => event.stopPropagation();
    const handleSharedChange = event => props.vm.setAssetForAllSprites(
        props.sharedAssetKind,
        props.selectedItemIndex,
        event.target.checked
    );
    const sharedAssetControl = props.selectedSharedItem && !props.isStage ? (
        <label
            className={styles.sharedControl}
            onClick={stopEditorEvent}
            onMouseDown={stopEditorEvent}
        >
            <FancyCheckbox
                checked={Boolean(props.selectedSharedItem.forAllSprites)}
                disabled={Boolean(props.selectedSharedItem.sharedAssetOwner &&
                    props.selectedSharedItem.sharedAssetOwner !== props.vm.editingTarget.id)}
                onChange={handleSharedChange}
            />
            <span>{'For all sprites'}</span>
        </label>
    ) : null;
    const children = React.Children.toArray(props.children).map(child => {
        if (React.isValidElement(child) && typeof child.type !== 'string') {
            return React.cloneElement(child, {sharedAssetControl});
        }
        return child;
    });
    return (<Box className={styles.wrapper}>
        <Selector
            className={styles.selector}
            {...props}
        />
        <Box className={styles.detailArea}>
            <Box
                className={props.selectedSharedItem && props.selectedSharedItem.sharedAssetOwner &&
                    props.selectedSharedItem.sharedAssetOwner !== props.vm.editingTarget.id ?
                    styles.readOnlyDetail : styles.editableDetail}
            >
                {children}
            </Box>
        </Box>
    </Box>);
};

AssetPanel.propTypes = {
    ...Selector.propTypes,
    isStage: PropTypes.bool,
    selectedSharedItem: PropTypes.object,
    sharedAssetKind: PropTypes.oneOf(['costume', 'sound', 'asset'])
};

export default AssetPanel;
