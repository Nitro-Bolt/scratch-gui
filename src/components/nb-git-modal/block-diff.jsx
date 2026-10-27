import PropTypes from 'prop-types';
import React, {useEffect, useMemo, useRef} from 'react';
import {defineMessages, injectIntl, intlShape} from 'react-intl';

import LazyScratchBlocks from '../../lib/tw-lazy-scratch-blocks';
import {getProjectScripts} from '../../lib/nb-git-block-scripts';
import styles from './block-diff.css';

const messages = defineMessages({
    noXml: {defaultMessage: 'No block XML is available for this revision.', id: 'nb.git.diff.noBlockXml'},
    renderError: {defaultMessage: 'Unable to render block XML: {error}', id: 'nb.git.diff.blockRenderError'},
    position: {defaultMessage: 'Position: {x}, {y}', id: 'nb.git.diff.position'},
    goToScript: {defaultMessage: 'Go to script', id: 'nb.git.diff.goToScript'},
    noScript: {defaultMessage: 'No script', id: 'nb.git.diff.noScript'},
    before: {defaultMessage: 'Before', id: 'nb.git.diff.before'},
    after: {defaultMessage: 'After', id: 'nb.git.diff.after'},
    noChangedScripts: {defaultMessage: 'No changed scripts.', id: 'nb.git.diff.noChangedScripts'}
});

const scriptChanged = row => !row.before || !row.after || row.before.signature !== row.after.signature ||
    row.before.x !== row.after.x || row.before.y !== row.after.y;

const changedBlockIds = (before, after) => {
    if (!before) {
        const signatures = (after && after.blockSignatures) || [];
        return {before: [], after: signatures.map(([id]) => id)};
    }
    if (!after) return {before: (before.blockSignatures || []).map(([id]) => id), after: []};
    const beforeBlocks = before.blockSignatures || [];
    const afterBlocks = after.blockSignatures || [];
    const unchangedBefore = [];
    const unchangedAfter = [];
    beforeBlocks.forEach(([id, signature]) => {
        const unchanged = afterBlocks.some(([afterId, afterSignature]) => afterId === id &&
            afterSignature === signature);
        if (unchanged) {
            unchangedBefore.push(id);
            unchangedAfter.push(id);
        }
    });
    const afterBySignature = [];
    afterBlocks.forEach(([id, signature]) => {
        if (unchangedAfter.includes(id)) return;
        let entry = afterBySignature.find(item => item.signature === signature);
        if (!entry) {
            entry = {ids: [], signature};
            afterBySignature.push(entry);
        }
        entry.ids.push(id);
    });
    const matchedBefore = [];
    const matchedAfter = [];
    beforeBlocks.forEach(([id, signature]) => {
        if (unchangedBefore.includes(id)) return;
        const entry = afterBySignature.find(item => item.signature === signature);
        if (!entry || !entry.ids.length) return;
        matchedBefore.push(id);
        matchedAfter.push(entry.ids.shift());
    });
    return {
        after: afterBlocks.map(([id]) => id).filter(id => !unchangedAfter.includes(id) && !matchedAfter.includes(id)),
        before: beforeBlocks.map(([id]) => id)
            .filter(id => !unchangedBefore.includes(id) && !matchedBefore.includes(id))
    };
};

const RenderedScript = ({highlightedBlockIds, highlightType, messages: labels, onShowScript, script}) => {
    const element = useRef(null);
    const handleShowScript = () => onShowScript(script);
    useEffect(() => {
        if (!element.current || !script) return;
        let workspace = null;
        let resizeObserver = null;
        let cancelled = false;
        element.current.replaceChildren();
        if (!script.source) {
            element.current.textContent = labels.noXml;
            return;
        }
        LazyScratchBlocks.load().then(() => {
            if (cancelled || !element.current) return;
            const ScratchBlocks = LazyScratchBlocks.get();
            const editorWorkspace = ScratchBlocks.getMainWorkspace();
            const media = editorWorkspace && editorWorkspace.options.pathToMedia ?
                editorWorkspace.options.pathToMedia :
                new URL('static/blocks-media/default/', document.baseURI).toString();
            workspace = ScratchBlocks.inject(element.current, {
                media,
                readOnly: true,
                scrollbars: true,
                sounds: false,
                zoom: {controls: true, wheel: true, startScale: 0.8}
            });
            const xml = ScratchBlocks.Xml.textToDom(`<xml xmlns="http://www.w3.org/1999/xhtml">${script.source}</xml>`);
            ScratchBlocks.Xml.domToWorkspace(xml, workspace);
            highlightedBlockIds.forEach(id => {
                const block = workspace.getBlockById(id);
                if (block && block.getSvgRoot()) {
                    block.getSvgRoot().classList.add(
                        highlightType === 'removed' ? styles.blockRemoved : styles.blockAdded
                    );
                }
            });
            ScratchBlocks.svgResize(workspace);
            workspace.zoomToFit();
            resizeObserver = new ResizeObserver(() => ScratchBlocks.svgResize(workspace));
            resizeObserver.observe(element.current);
        })
            .catch(error => {
                if (element.current && !cancelled) {
                    element.current.textContent = labels.renderError(error.message);
                }
            });
        return () => {
            cancelled = true;
            if (resizeObserver) resizeObserver.disconnect();
            if (workspace) workspace.dispose();
        };
    }, [labels, script]);
    return script ? (
        <div className={styles.script}>
            <div className={styles.scriptHeader}>
                <span>{labels.position(script.x, script.y)}</span>
                {/* eslint-disable-next-line react/jsx-no-bind */}
                {onShowScript && script.teleportable && <button onClick={handleShowScript}>{labels.goToScript}</button>}
            </div>
            <div
                className={styles.blocks}
                ref={element}
            />
        </div>
    ) : <div className={styles.missing}>{labels.noScript}</div>;
};

RenderedScript.propTypes = {
    highlightedBlockIds: PropTypes.arrayOf(PropTypes.string).isRequired,
    highlightType: PropTypes.oneOf(['added', 'removed']).isRequired,
    messages: PropTypes.shape({
        goToScript: PropTypes.string.isRequired,
        noScript: PropTypes.string.isRequired,
        noXml: PropTypes.string.isRequired,
        position: PropTypes.func.isRequired,
        renderError: PropTypes.func.isRequired
    }).isRequired,
    onShowScript: PropTypes.func,
    script: PropTypes.shape({
        source: PropTypes.string,
        teleportable: PropTypes.bool.isRequired,
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired
    })
};

const BlockDiff = ({afterProject, beforeProject, intl, onShowScript, vm}) => {
    const rows = useMemo(() => {
        const before = getProjectScripts(beforeProject, vm);
        const after = getProjectScripts(afterProject, vm);
        const remainingAfter = [...after];
        const result = before.map(script => {
            const matchingIndex = remainingAfter.findIndex(candidate => candidate.id === script.id);
            const matching = matchingIndex >= 0 ? remainingAfter[matchingIndex] : null;
            if (matching) {
                remainingAfter.splice(matchingIndex, 1);
            }
            return {before: script, after: matching};
        });
        remainingAfter.forEach(script => result.push({before: null, after: script}));
        return result.filter(scriptChanged);
    }, [afterProject, beforeProject, vm]);
    const labels = useMemo(() => ({
        goToScript: intl.formatMessage(messages.goToScript),
        noScript: intl.formatMessage(messages.noScript),
        noXml: intl.formatMessage(messages.noXml),
        position: (x, y) => intl.formatMessage(messages.position, {x, y}),
        renderError: error => intl.formatMessage(messages.renderError, {error})
    }), [intl]);
    return (
        <div className={styles.diff}>
            <div className={styles.heading}>{intl.formatMessage(messages.before)}</div>
            <div className={styles.heading}>{intl.formatMessage(messages.after)}</div>
            {rows.map(row => {
                const changed = changedBlockIds(row.before, row.after);
                return (
                    <React.Fragment key={(row.before || row.after).id}>
                        <div className={`${styles.cell} ${styles.removed}`}>
                            <RenderedScript
                                highlightType="removed"
                                highlightedBlockIds={[...changed.before]}
                                messages={labels}
                                script={row.before}
                            />
                        </div>
                        <div className={`${styles.cell} ${styles.added}`}>
                            <RenderedScript
                                highlightType="added"
                                highlightedBlockIds={[...changed.after]}
                                messages={labels}
                                script={row.after}
                                onShowScript={onShowScript}
                            />
                        </div>
                    </React.Fragment>
                );
            })}
            {rows.length === 0 && <div className={styles.empty}>
                {intl.formatMessage(messages.noChangedScripts)}
            </div>}
        </div>
    );
};

BlockDiff.propTypes = {
    afterProject: PropTypes.object,
    beforeProject: PropTypes.object,
    intl: intlShape.isRequired,
    onShowScript: PropTypes.func.isRequired,
    vm: PropTypes.shape({
        serializedBlockToXML: PropTypes.func.isRequired,
        serializedCommentToXML: PropTypes.func.isRequired
    }).isRequired
};

export default injectIntl(BlockDiff);
