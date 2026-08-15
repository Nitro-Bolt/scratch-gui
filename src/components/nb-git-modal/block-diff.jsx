import PropTypes from 'prop-types';
import React, {useEffect, useMemo, useRef} from 'react';

import LazyScratchBlocks from '../../lib/tw-lazy-scratch-blocks';
import {getProjectScripts} from '../../lib/nb-git-block-scripts';
import styles from './block-diff.css';

const scriptChanged = row => !row.before || !row.after || row.before.signature !== row.after.signature ||
    row.before.x !== row.after.x || row.before.y !== row.after.y;

const RenderedScript = ({onShowScript, script}) => {
    const element = useRef(null);
    const handleShowScript = () => onShowScript(script);
    useEffect(() => {
        if (!element.current || !script) return;
        let workspace = null;
        let resizeObserver = null;
        let cancelled = false;
        element.current.replaceChildren();
        if (!script.source) {
            element.current.textContent = 'No block XML is available for this revision.';
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
            ScratchBlocks.svgResize(workspace);
            workspace.zoomToFit();
            resizeObserver = new ResizeObserver(() => ScratchBlocks.svgResize(workspace));
            resizeObserver.observe(element.current);
        })
            .catch(error => {
                if (element.current && !cancelled) {
                    element.current.textContent = `Unable to render block XML: ${error.message}`;
                }
            });
        return () => {
            cancelled = true;
            if (resizeObserver) resizeObserver.disconnect();
            if (workspace) workspace.dispose();
        };
    }, [script]);
    return script ? (
        <div className={styles.script}>
            <div className={styles.scriptHeader}>
                <span>{`Position: ${script.x}, ${script.y}`}</span>
                {/* eslint-disable-next-line react/jsx-no-bind */}
                {onShowScript && script.teleportable && <button onClick={handleShowScript}>{'Go to script'}</button>}
            </div>
            <div
                className={styles.blocks}
                ref={element}
            />
        </div>
    ) : <div className={styles.missing}>{'No script'}</div>;
};

RenderedScript.propTypes = {
    onShowScript: PropTypes.func,
    script: PropTypes.shape({
        source: PropTypes.string,
        teleportable: PropTypes.bool.isRequired,
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired
    })
};

const BlockDiff = ({afterProject, beforeProject, onShowScript}) => {
    const rows = useMemo(() => {
        const before = getProjectScripts(beforeProject);
        const after = getProjectScripts(afterProject);
        const afterById = new Map(after.map(script => [script.id, script]));
        const result = before.map(script => {
            const matching = afterById.get(script.id) || null;
            if (matching) afterById.delete(script.id);
            return {before: script, after: matching};
        });
        afterById.forEach(script => result.push({before: null, after: script}));
        return result.filter(scriptChanged);
    }, [afterProject, beforeProject]);
    return (
        <div className={styles.diff}>
            <div className={styles.heading}>{'Before'}</div>
            <div className={styles.heading}>{'After'}</div>
            {rows.map(row => (
                <React.Fragment key={(row.before || row.after).id}>
                    <div className={`${styles.cell} ${styles.removed}`}>
                        <RenderedScript
                            script={row.before}
                        />
                    </div>
                    <div className={`${styles.cell} ${styles.added}`}>
                        <RenderedScript
                            script={row.after}
                            onShowScript={onShowScript}
                        />
                    </div>
                </React.Fragment>
            ))}
            {rows.length === 0 && <div className={styles.empty}>{'No changed scripts.'}</div>}
        </div>
    );
};

BlockDiff.propTypes = {
    afterProject: PropTypes.object,
    beforeProject: PropTypes.object,
    onShowScript: PropTypes.func.isRequired
};

export default BlockDiff;
