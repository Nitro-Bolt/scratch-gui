import PropTypes from 'prop-types';
import React from 'react';

import BlockDiff from './block-diff.jsx';
import TextDiff from './text-diff.jsx';
import styles from './project-diff.css';

const ProjectDiff = ({dark, diff, onClose, onShowScript}) => (
    <div className={styles.viewer}>
        <div className={styles.toolbar}>
            <span className={styles.path}>
                {diff.originalPath ? `${diff.originalPath} → ${diff.path}` : diff.path}
            </span>
            <button
                className={styles.close}
                onClick={onClose}
            >{'Close Diff'}</button>
        </div>
        {diff.kind === 'blocks' && <BlockDiff
            beforeProject={diff.beforeProject}
            afterProject={diff.afterProject}
            onShowScript={onShowScript}
        />}
        {diff.kind === 'text' && <TextDiff
            before={diff.before}
            after={diff.after}
            dark={dark}
            path={diff.path}
        />}
        {diff.kind === 'asset' && (
            <div className={styles.assetDiff}>
                {'Binary asset changed. Git stores this file without noisy text diffs.'}
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
    onClose: PropTypes.func.isRequired,
    onShowScript: PropTypes.func.isRequired
};

export default ProjectDiff;
