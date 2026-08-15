import PropTypes from 'prop-types';
import React, {useEffect, useMemo, useRef} from 'react';
import {SequenceMatcher} from 'difflib';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

import styles from './text-diff.css';

const normalizedSource = source => (typeof source === 'string' ? source.replace(/\r\n/g, '\n') : '');

const languageForPath = filePath => {
    const extension = String(filePath || '').split('.')
        .pop()
        .toLowerCase();
    return ({
        css: 'css',
        csv: 'plaintext',
        html: 'html',
        js: 'javascript',
        json: 'json',
        jsx: 'javascript',
        md: 'markdown',
        mjs: 'javascript',
        ts: 'typescript',
        tsx: 'typescript',
        xml: 'xml',
        yaml: 'yaml',
        yml: 'yaml'
    })[extension] || 'plaintext';
};

const TextDiff = ({after, before, dark, path}) => {
    const editorElement = useRef(null);
    const comparison = useMemo(() => {
        const original = normalizedSource(before);
        const modified = normalizedSource(after);
        const beforeLines = original.split('\n');
        const afterLines = modified.split('\n');
        const opcodes = new SequenceMatcher(null, beforeLines, afterLines).getOpcodes();
        return {
            changed: opcodes.some(([tag]) => tag !== 'equal'),
            height: Math.min(520, Math.max(220, (Math.max(beforeLines.length, afterLines.length) * 19) + 30)),
            modified,
            original
        };
    }, [after, before]);

    useEffect(() => {
        if (!comparison.changed || !editorElement.current) return () => null;
        const language = languageForPath(path);
        const originalModel = monaco.editor.createModel(comparison.original, language);
        const modifiedModel = monaco.editor.createModel(comparison.modified, language);
        const editor = monaco.editor.createDiffEditor(editorElement.current, {
            automaticLayout: true,
            contextmenu: false,
            enableSplitViewResizing: true,
            fontSize: 12,
            minimap: {enabled: false},
            originalEditable: false,
            overviewRulerLanes: 0,
            readOnly: true,
            renderIndicators: true,
            renderSideBySide: true,
            scrollBeyondLastLine: false,
            theme: dark ? 'vs-dark' : 'vs',
            wordWrap: 'on'
        });
        editor.setModel({original: originalModel, modified: modifiedModel});
        return () => {
            editor.dispose();
            originalModel.dispose();
            modifiedModel.dispose();
        };
    }, [comparison, dark, path]);

    if (!comparison.changed) return <div className={styles.empty}>{'No textual changes.'}</div>;
    return (
        <div className={styles.diff}>
            <div
                ref={editorElement}
                style={{height: comparison.height}}
            />
        </div>
    );
};

TextDiff.propTypes = {
    after: PropTypes.string,
    before: PropTypes.string,
    dark: PropTypes.bool,
    path: PropTypes.string.isRequired
};

export default TextDiff;
