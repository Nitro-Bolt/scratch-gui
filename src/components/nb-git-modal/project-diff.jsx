import PropTypes from 'prop-types';
import React from 'react';
import {defineMessages, injectIntl, intlShape} from 'react-intl';

import BlockDiff from './block-diff.jsx';
import TextDiff from './text-diff.jsx';
import styles from './project-diff.css';

const messages = defineMessages({
    close: {defaultMessage: 'Close Diff', id: 'nb.git.diff.close'},
    binaryChanged: {
        defaultMessage: 'Binary asset changed. Git stores this file without noisy text diffs.',
        id: 'nb.git.diff.binaryChanged'
    }
});

const ProjectDiff = ({dark, diff, intl, onClose, onShowScript, vm}) => (
    <div className={styles.viewer}>
        <div className={styles.toolbar}>
            <span className={styles.path}>
                {diff.originalPath ? `${diff.originalPath} → ${diff.path}` : diff.path}
            </span>
            <button
                className={styles.close}
                onClick={onClose}
            >{intl.formatMessage(messages.close)}</button>
        </div>
        {diff.kind === 'blocks' && <BlockDiff
            beforeProject={diff.beforeProject}
            afterProject={diff.afterProject}
            onShowScript={onShowScript}
            vm={vm}
        />}
        {diff.kind === 'text' && <TextDiff
            before={diff.before}
            after={diff.after}
            dark={dark}
            path={diff.path}
        />}
        {diff.kind === 'asset' && (
            <div className={styles.assetDiff}>
                {intl.formatMessage(messages.binaryChanged)}
            </div>
        )}
    </div>
);

ProjectDiff.propTypes = {
    dark: PropTypes.bool,
    diff: PropTypes.shape({
        after: PropTypes.string,
        afterProject: PropTypes.object,
        before: PropTypes.string,
        beforeProject: PropTypes.object,
        kind: PropTypes.oneOf(['asset', 'blocks', 'text']).isRequired,
        originalPath: PropTypes.string,
        path: PropTypes.string.isRequired
    }).isRequired,
    intl: intlShape.isRequired,
    onClose: PropTypes.func.isRequired,
    onShowScript: PropTypes.func.isRequired,
    vm: PropTypes.shape({
        serializedBlockToXML: PropTypes.func.isRequired,
        serializedCommentToXML: PropTypes.func.isRequired
    }).isRequired
};

export default injectIntl(ProjectDiff);
