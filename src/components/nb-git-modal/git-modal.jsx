import PropTypes from 'prop-types';
import React, {useEffect, useMemo, useState} from 'react';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import {connect} from 'react-redux';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import Modal from '../../containers/modal.jsx';
import Box from '../box/box.jsx';
import ProjectDiff from './project-diff.jsx';
import log from '../../lib/log';
import LazyScratchBlocks from '../../lib/tw-lazy-scratch-blocks';
import {markGitProjectLoaded, pauseGitProjectSync, requestGitProjectSync,
    resumeGitProjectSync} from '../../containers/nb-git-project-manager.jsx';
import styles from './git-modal.css';

const messages = defineMessages({
    title: {defaultMessage: 'Source Control', id: 'nb.git.title'},
    desktopOnly: {defaultMessage: 'Git is only available in NitroBolt Desktop.', id: 'nb.git.desktopOnly'},
    gitMissing: {defaultMessage: 'Git is not installed or could not be found.', id: 'nb.git.missing'}
});
const navigation = [
    {
        id: 'general',
        label: 'General',
        views: [
            {id: 'branches', label: 'Branches'},
            {id: 'remotes', label: 'Remotes'},
            {id: 'history', label: 'History'},
            {id: 'controls', label: 'Merging & Controls'}
        ]
    },
    {id: 'changes', label: 'Changes'},
    {id: 'readme', label: 'README'}
];
const badgeClass = {'U': 'statusU', 'M': 'statusM', 'D': 'statusD', '!': 'statusConflict'};
const Badge = ({value}) => (
    <span className={`${styles.statusBadge} ${styles[badgeClass[value] || 'statusM']}`}>{value}</span>
);
Badge.propTypes = {value: PropTypes.string.isRequired};

const ReadmeEditor = ({dark, onChange, value}) => {
    const element = React.useRef(null);
    const editor = React.useRef(null);
    const model = React.useRef(null);
    const onChangeRef = React.useRef(onChange);
    onChangeRef.current = onChange;
    useEffect(() => {
        if (!element.current) return () => null;
        model.current = monaco.editor.createModel(value, 'plaintext');
        editor.current = monaco.editor.create(element.current, {
            automaticLayout: true,
            contextmenu: true,
            fontSize: 13,
            minimap: {enabled: false},
            model: model.current,
            overviewRulerLanes: 0,
            scrollBeyondLastLine: false,
            theme: dark ? 'vs-dark' : 'vs',
            wordWrap: 'on'
        });
        const listener = editor.current.onDidChangeModelContent(() => onChangeRef.current(model.current.getValue()));
        return () => {
            listener.dispose();
            editor.current.dispose();
            model.current.dispose();
            editor.current = null;
            model.current = null;
        };
    }, [dark]);
    useEffect(() => {
        if (model.current && model.current.getValue() !== value) model.current.setValue(value);
    }, [value]);
    return (<div
        className={styles.readmeMonaco}
        ref={element}
    />);
};

ReadmeEditor.propTypes = {
    dark: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    value: PropTypes.string.isRequired
};

const gitErrorMessage = result => (result && result.error) || 'Git operation failed.';
const managedProjectFile = filePath => {
    const normalized = filePath.replace(/\\/g, '/');
    return normalized === 'project.json' || /(^|\/)(target|blocks)\.json$/.test(normalized) ||
        /(^|\/)assets\//.test(normalized);
};
const canDiscardIndividually = change => {
    const managed = managedProjectFile(change.path) ||
        (change.originalPath && managedProjectFile(change.originalPath));
    return !managed || (change.status !== 'U' && !change.originalPath);
};

const GitModal = props => {
    const [available, setAvailable] = useState(null);
    const [repoPath, setRepoPath] = useState(props.projectPath || '');
    const [status, setStatus] = useState(null);
    const [branches, setBranches] = useState([]);
    const [remotes, setRemotes] = useState([]);
    const [history, setHistory] = useState([]);
    const [view, setView] = useState('changes');
    const [diff, setDiff] = useState(null);
    const [selected, setSelected] = useState(null);
    const [discardPath, setDiscardPath] = useState(null);
    const [discardAllPending, setDiscardAllPending] = useState(false);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState('');
    const [branchName, setBranchName] = useState('');
    const [renamingBranch, setRenamingBranch] = useState(null);
    const [renamedBranch, setRenamedBranch] = useState('');
    const [deleteBranchRef, setDeleteBranchRef] = useState(null);
    const [remoteName, setRemoteName] = useState('origin');
    const [remoteUrl, setRemoteUrl] = useState('');
    const [remote, setRemote] = useState('origin');
    const [mergeBranch, setMergeBranch] = useState('');
    const [mergeTarget, setMergeTarget] = useState('');
    const [readme, setReadme] = useState('');
    const [readmeRevision, setReadmeRevision] = useState(null);
    const actionRunning = React.useRef(false);
    const diffRequest = React.useRef(0);
    const refreshRequest = React.useRef(0);
    const repository = Boolean(status && status.isRepository);
    const repositoryRevision = repository ? `${repoPath}:${status.commit || 'unborn'}` : null;

    const failed = result => {
        if (result && result.success) return false;
        log.error(gitErrorMessage(result));
        return true;
    };
    const clearDiff = () => {
        diffRequest.current++;
        setDiff(null);
        setSelected(null);
    };
    const clearRepositoryState = () => {
        refreshRequest.current++;
        setStatus(null);
        setBranches([]);
        setRemotes([]);
        setHistory([]);
        clearDiff();
        setDiscardPath(null);
        setDiscardAllPending(false);
        setReadmeRevision(null);
        setLoading(false);
    };
    const refresh = async (path = repoPath) => {
        const request = ++refreshRequest.current;
        if (!path || !window.Git) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const result = await window.Git.status(path);
            if (request !== refreshRequest.current) return;
            if (failed(result)) return;
            if (!result.data.isRepository) {
                clearRepositoryState();
                return;
            }
            setStatus(result.data);
            const results = await Promise.all([window.Git.listBranches(path), window.Git.remotes(path),
                window.Git.log(path, 50)]);
            if (request !== refreshRequest.current) return;
            if (failed(results[0])) {
                setBranches([]);
            } else {
                const nextBranches = [...results[0].branches];
                if (result.data.branch && !nextBranches.some(item => item.name === result.data.branch)) {
                    nextBranches.unshift({
                        name: result.data.branch,
                        ref: `refs/heads/${result.data.branch}`,
                        isCurrent: true,
                        isRemote: false
                    });
                }
                setBranches(nextBranches);
            }
            if (failed(results[1])) {
                setRemotes([]);
                setRemote('');
            } else {
                setRemotes(results[1].remotes);
                if (!results[1].remotes.length) {
                    setRemote('');
                } else if (!results[1].remotes.some(item => item.name === remote)) {
                    setRemote(results[1].remotes[0].name);
                }
            }
            if (failed(results[2])) setHistory([]);
            else setHistory(results[2].commits.filter(commit => commit.hash));
        } catch (e) {
            if (request === refreshRequest.current) log.error(e);
        } finally {
            if (request === refreshRequest.current) setLoading(false);
        }
    };
    useEffect(() => {
        if (!window.Git) {
            setAvailable(false);
            setLoading(false);
            return;
        }
        window.Git.isAvailable()
            .then(value => {
                setAvailable(value);
                if (value && repoPath) refresh(repoPath);
                else setLoading(false);
            })
            .catch(error => {
                log.error(error);
                setAvailable(false);
                setLoading(false);
            });
    }, []);
    useEffect(() => {
        if (props.projectPath) setRepoPath(props.projectPath);
    }, [props.projectPath]);
    useEffect(() => {
        let cancelled = false;
        if (view === 'readme' && repositoryRevision && readmeRevision !== repositoryRevision) {
            window.Git.readReadme(repoPath)
                .then(result => {
                    if (!cancelled && !failed(result)) {
                        setReadme(result.contents);
                        setReadmeRevision(repositoryRevision);
                    }
                })
                .catch(log.error);
        }
        return () => {
            cancelled = true;
        };
    }, [view, repoPath, repositoryRevision, readmeRevision]);
    const run = action => {
        if (actionRunning.current) return Promise.resolve();
        actionRunning.current = true;
        setBusy(true);
        return Promise.resolve()
            .then(action)
            .catch(log.error)
            .then(() => {
                actionRunning.current = false;
                setBusy(false);
            });
    };
    const reloadProject = async (path = repoPath) => {
        const result = await window.Git.readProject(path);
        if (!result || !result.success) throw new Error(gitErrorMessage(result));
        props.onSetProjectPath(null);
        props.onClearFileHandle();
        clearDiff();
        setDiscardPath(null);
        setDiscardAllPending(false);
        try {
            props.vm.quit();
            await props.vm.loadProject(result.data);
            if (props.vm.renderer) props.vm.renderer.draw();
        } catch (error) {
            markGitProjectLoaded();
            throw error;
        }
        props.onSetProjectPath(path);
        markGitProjectLoaded();
    };
    const chooseFolder = () => run(async () => {
        const result = await window.EditorPreload.showOpenDirectoryPicker();
        if (!result || !result.path) return;
        clearRepositoryState();
        setLoading(true);
        try {
            const next = await window.Git.status(result.path);
            if (failed(next)) return;
            const selectedRepoPath = next.data.repositoryRoot || result.path;
            setRepoPath(selectedRepoPath);
            if (next.data.isRepository) {
                let paused = false;
                try {
                    await pauseGitProjectSync();
                    paused = true;
                    await reloadProject(selectedRepoPath);
                } finally {
                    if (paused) resumeGitProjectSync();
                }
            } else {
                props.onSetProjectPath(null);
            }
            await refresh(selectedRepoPath);
        } finally {
            setLoading(false);
        }
    });
    const init = () => run(async () => {
        const result = await window.Git.init(repoPath, props.preferences['git-default-branch'] || 'master');
        if (failed(result)) return;
        try {
            await requestGitProjectSync(repoPath);
            props.onSetProjectPath(repoPath);
            const addResult = await window.Git.add(repoPath, []);
            if (failed(addResult)) return;
            const commitResult = await window.Git.commit(repoPath, 'Initial commit');
            if (failed(commitResult)) return;
        } finally {
            await refresh();
        }
    });
    const mutate = (method, files) => run(async () => {
        if (method === 'add') await requestGitProjectSync(repoPath);
        const result = await window.Git[method](repoPath, files);
        if (!failed(result)) await refresh();
    });
    const discardChange = change => run(async () => {
        if (discardPath !== change.path) {
            setDiscardPath(change.path);
            return;
        }
        let paused = false;
        try {
            await pauseGitProjectSync();
            paused = true;
            const result = await window.Git.discard(repoPath, change.path, change.originalPath);
            if (!result || !result.success) throw new Error(gitErrorMessage(result));
            clearDiff();
            setDiscardPath(null);
            if (result.tracked) await reloadProject();
            await refresh();
        } finally {
            if (paused) resumeGitProjectSync();
        }
    });
    const discardAllChanges = () => run(async () => {
        if (!discardAllPending) {
            setDiscardAllPending(true);
            return;
        }
        let paused = false;
        let restoredTrackedFile = false;
        try {
            await pauseGitProjectSync();
            paused = true;
            const files = [...(status.untracked || []), ...(status.unstaged || [])];
            for (const change of files) {
                const result = await window.Git.discard(repoPath, change.path, change.originalPath);
                if (!result || !result.success) throw new Error(gitErrorMessage(result));
                restoredTrackedFile = restoredTrackedFile || result.tracked;
            }
            clearDiff();
            setDiscardPath(null);
            setDiscardAllPending(false);
            if (restoredTrackedFile) await reloadProject();
            await refresh();
        } finally {
            if (paused) resumeGitProjectSync();
        }
    });
    const showDiff = (change, staged) => run(async () => {
        const request = ++diffRequest.current;
        setSelected(`${staged ? 's' : 'w'}:${change.path}`);
        try {
            await requestGitProjectSync(repoPath);
        } catch (error) {
            log.error(error);
        }
        const result = await window.Git.projectDiff(repoPath, change.path, staged, change.originalPath);
        if (request !== diffRequest.current) return;
        if (failed(result)) {
            setSelected(null);
            return;
        }
        setDiff(result.data);
    });
    const commit = () => run(async () => {
        if (!message.trim()) throw new Error('Enter a commit message.');
        const result = await window.Git.commit(repoPath, message.trim());
        if (!failed(result)) {
            setMessage('');
            await refresh();
        }
    });
    const switchBranch = ref => run(async () => {
        let paused = false;
        try {
            await pauseGitProjectSync();
            paused = true;
            const result = await window.Git.switchBranch(repoPath, ref);
            if (!failed(result)) {
                await reloadProject();
                await refresh();
            }
        } finally {
            if (paused) resumeGitProjectSync();
        }
    });
    const createBranch = () => run(async () => {
        if (!branchName.trim()) throw new Error('Enter a branch name.');
        const result = await window.Git.createBranch(repoPath, branchName.trim());
        if (!failed(result)) {
            setBranchName('');
            await refresh();
        }
    });
    const renameBranch = () => run(async () => {
        if (!renamingBranch || !renamedBranch.trim()) return;
        const result = await window.Git.renameBranch(repoPath, renamingBranch.ref, renamedBranch.trim());
        if (!failed(result)) {
            setRenamingBranch(null);
            setRenamedBranch('');
            await refresh();
        }
    });
    const deleteBranch = branch => run(async () => {
        const result = await window.Git.deleteBranch(repoPath, branch.ref);
        if (!failed(result)) {
            setDeleteBranchRef(null);
            await refresh();
        }
    });
    const addRemote = () => run(async () => {
        if (!remoteName.trim() || !remoteUrl.trim()) throw new Error('Enter a remote name and URL.');
        const result = await window.Git.addRemote(repoPath, remoteName.trim(), remoteUrl.trim());
        if (!failed(result)) {
            setRemoteUrl('');
            await refresh();
        }
    });
    const removeRemote = name => run(async () => {
        const result = await window.Git.removeRemote(repoPath, name);
        if (!failed(result)) await refresh();
    });
    const merge = () => run(async () => {
        let paused = false;
        try {
            await pauseGitProjectSync();
            paused = true;
            const result = await window.Git.merge(repoPath, mergeBranch, mergeTarget);
            if (!failed(result)) {
                setMergeBranch('');
                setMergeTarget('');
                await reloadProject();
                await refresh();
            }
        } finally {
            if (paused) resumeGitProjectSync();
        }
    });
    const safeStatus = status || {branch: '', commit: null, staged: []};
    const syncRemote = method => run(async () => {
        let paused = false;
        try {
            if (method === 'pull') {
                await pauseGitProjectSync();
                paused = true;
            }
            const result = await window.Git[method](repoPath, remote, safeStatus.branch);
            if (!failed(result)) {
                if (method === 'pull') await reloadProject();
                await refresh();
            }
        } finally {
            if (paused) resumeGitProjectSync();
        }
    });
    const saveReadme = () => run(async () => {
        const result = await window.Git.writeReadme(repoPath, readme);
        if (!failed(result)) await refresh();
    });
    const showScript = script => {
        if (!script || !script.rootId) return;
        const target = props.vm.runtime.targets
            .filter(candidate => candidate.isOriginal)
            .find(candidate => candidate.blocks.getBlock(script.rootId));
        if (!target) {
            log.warn(`Unable to find target for script ${script.rootId}.`);
            return;
        }
        props.vm.setEditingTarget(target.id);
        props.onShowBlocks();
        props.onClose();
        let attempts = 0;
        const centerScript = () => {
            attempts++;
            LazyScratchBlocks.load().then(() => {
                const ScratchBlocks = LazyScratchBlocks.get();
                const workspaces = Object.values(ScratchBlocks.Workspace.WorkspaceDB_ || {});
                const workspace = workspaces.find(candidate => candidate.rendered &&
                    !candidate.options.readOnly && !candidate.options.parentWorkspace &&
                    candidate.getBlockById(script.rootId));
                const block = workspace && workspace.getBlockById(script.rootId);
                if (!block && attempts < 30) {
                    setTimeout(centerScript, 100);
                    return;
                }
                if (block) {
                    workspace.centerOnBlock(script.rootId);
                    block.select();
                } else {
                    log.warn(`Unable to find script ${script.rootId} in the editor workspace.`);
                }
            })
                .catch(log.error);
        };
        setTimeout(centerScript, 0);
    };
    const revertToCommit = commitHash => run(async () => {
        let paused = false;
        try {
            await pauseGitProjectSync();
            paused = true;
            const result = await window.Git.revertToCommit(repoPath, commitHash);
            if (!failed(result)) {
                await reloadProject();
                await refresh();
            }
        } finally {
            if (paused) resumeGitProjectSync();
        }
    });
    const changes = useMemo(() => (status ? [
        ...(status.staged || []).map(item => ({...item, group: 'Staged', staged: true})),
        ...(status.conflicted || []).map(item => ({...item, status: '!', group: 'Conflicts', staged: false})),
        ...(status.untracked || []).map(item => ({...item, status: 'U', group: 'Changes', staged: false})),
        ...(status.unstaged || []).map(item => ({...item, group: 'Changes', staged: false}))
    ] : []), [status]);
    const local = branches.filter(item => !item.isRemote);
    const remoteBranches = branches.filter(item => item.isRemote);
    const selectedRemoteExists = remotes.some(item => item.name === remote);

    /* eslint-disable indent, react/jsx-no-bind, react/jsx-no-literals */
    const filesPane = (<div className={styles.fileGroups}>{['Staged', 'Conflicts', 'Changes'].map(group => {
        const files = changes.filter(item => item.group === group);
        return files.length ? <section
            className={styles.fileGroup}
            key={group}
        >
            <div className={styles.groupHeading}><span>{group}</span><span className={styles.groupCount}>{files.length}
                {group === 'Staged' && <button
                    title="Unstage all"
                    onClick={() => mutate('reset', [])}
                >−</button>}
                {group === 'Changes' && <button
                    title="Stage all"
                    onClick={() => mutate('add', [])}
                >+</button>}
                {group === 'Changes' && <button
                    title={discardAllPending ? 'Click again to confirm discard all' : 'Discard all changes'}
                    onClick={discardAllChanges}
                >{discardAllPending ? '!' : '↶'}</button>}
            </span></div>
            {files.map(item => (<div
                className={`${styles.fileItem} ${selected === `${item.staged ? 's' : 'w'}:${item.path}` ?
                    styles.fileItemActive : ''}`}
                key={`${group}:${item.path}`}
            >
                <button
                    className={styles.fileSelect}
                    onClick={() => showDiff(item, item.staged)}
                >
                    <Badge value={item.status} />
                    <span className={styles.fileName}>{item.path}</span>
                </button>
                {!item.staged && <button
                    className={styles.inlineAction}
                    disabled={busy || !canDiscardIndividually(item)}
                    title={canDiscardIndividually(item) ?
                        (discardPath === item.path ? 'Click again to confirm' : 'Undo change') :
                        'Use Discard all to remove this project change safely'}
                    onClick={() => discardChange(item)}
                >{discardPath === item.path ? '!' : '↶'}</button>}
                <button
                    className={styles.inlineAction}
                    title={item.staged ? 'Unstage' : 'Stage'}
                    onClick={() => mutate(item.staged ? 'reset' : 'add',
                        [item.path, item.originalPath].filter(Boolean))}
                >{item.staged ? '−' : '+'}</button>
            </div>))}</section> : null;
    })}{!changes.length && <div className={styles.emptyState}>Working tree clean</div>}</div>);

    const header = (title, subtitle) => (<div className={styles.paneHeader}><div><h3>{title}</h3>
        {subtitle && <p>{subtitle}</p>}</div></div>);
    let context;
    if (view === 'changes') {
        context = (<>{header('Changes', `${changes.length} changed file${changes.length === 1 ? '' : 's'}`)}
            <div className={styles.commitBox}><textarea
                className={styles.commitInput}
                value={message}
                onChange={event => setMessage(event.target.value)}
                placeholder="Commit message"
            />
                <button
                    className={styles.primaryButton}
                    disabled={busy || !safeStatus.staged.length}
                    onClick={commit}
                >Commit</button>
            </div>{filesPane}</>);
    } else if (view === 'branches') {
        context = (<>{header('Branches')}<div className={styles.formCard}><label>New branch</label>
            <div className={styles.inputRow}><input
                value={branchName}
                onChange={event => setBranchName(event.target.value)}
                placeholder="feature/name"
            /><button
                className={styles.primaryButton}
                disabled={busy || !branchName.trim()}
                onClick={createBranch}
            >Create</button></div></div>
            {[['Local', local], ['Remote', remoteBranches]].map(([label, items]) => (<div
                className={styles.listSection}
                key={label}
            ><h4>{label}</h4>
                <div className={styles.branchList}>
                    {!items.length && <div className={styles.emptyList}>No {label.toLowerCase()} branches</div>}
                    {items.map(item => (<div
                        className={styles.branchRow}
                        key={item.ref}
                    >
                        {renamingBranch && renamingBranch.ref === item.ref ? <>
                            <input
                                value={renamedBranch}
                                onChange={event => setRenamedBranch(event.target.value)}
                            />
                            <button
                                disabled={!renamedBranch.trim()}
                                onClick={renameBranch}
                            >Save</button>
                            <button onClick={() => setRenamingBranch(null)}>Cancel</button>
                        </> : <>
                            <button
                                className={styles.listItem}
                                onClick={() => !item.isCurrent && switchBranch(item.ref)}
                            ><span>{item.name}</span>{item.isCurrent && <em>current</em>}</button>
                            {!item.isRemote && <button
                                onClick={() => {
                                setRenamingBranch(item);
                                setRenamedBranch(item.name);
                            }}
                            >Rename</button>}
                            <button
                                disabled={item.isCurrent}
                                onClick={() => {
                                if (deleteBranchRef === item.ref) deleteBranch(item);
                                else setDeleteBranchRef(item.ref);
                            }}
                            >{deleteBranchRef === item.ref ? 'Confirm' : 'Delete'}</button>
                        </>}
                    </div>))}
                </div></div>))}</>);
    } else if (view === 'remotes') {
        context = (<>{header('Remotes')}<div className={styles.formCard}>
            <label>Add remote</label><input
                value={remoteName}
                onChange={event => setRemoteName(event.target.value)}
                placeholder="origin"
            />
            <input
                value={remoteUrl}
                onChange={event => setRemoteUrl(event.target.value)}
                placeholder="https://…"
            />
            <button
                className={styles.primaryButton}
                onClick={addRemote}
            >Add remote</button></div>
            <div className={styles.listSection}>{remotes.map(item => (
                <div
                    className={styles.remoteItem}
                    key={item.name}
                >
                    <div><strong>{item.name}</strong><span>{item.fetch || item.push}</span></div>
                    <button onClick={() => removeRemote(item.name)}>Remove</button>
                </div>
            ))}</div></>);
    } else if (view === 'history') {
        context = (<>{header('History')}<div className={styles.historyList}>{history.map(item =>
            (<div
                className={styles.commitItem}
                key={item.hash}
            ><div><strong>{item.subject}</strong>
                <span>{item.shortHash} · {item.author}</span>
                <small>{item.branch} · {item.relativeDate}</small>
                {item.shortHash !== safeStatus.commit && <button
                    className={styles.revertButton}
                    onClick={() => revertToCommit(item.hash)}
                >Revert to this commit</button>}</div></div>))}</div></>);
    } else if (view === 'controls') {
        context = (<>{header('Merging & Controls')}<div className={styles.formCard}>
            <label>Merge branch</label><select
                value={mergeBranch}
                onChange={event => setMergeBranch(event.target.value)}
            >
                <option value="">Choose source branch…</option>{branches.map(item =>
                    (<option
                        value={item.ref}
                        key={item.ref}
                    >{item.name}</option>))}</select>
            <label>Into branch</label><select
                value={mergeTarget}
                onChange={event => setMergeTarget(event.target.value)}
            >
                <option value="">Choose destination branch…</option>
                {local.filter(item => item.ref !== mergeBranch).map(item => (
                    <option
                        value={item.ref}
                        key={item.ref}
                    >{item.name}</option>
                ))}
            </select>
            <button
                className={styles.primaryButton}
                disabled={!mergeBranch || !mergeTarget || mergeBranch === mergeTarget}
                onClick={merge}
            >Merge</button></div><div className={styles.formCard}>
                <label>Remote sync</label><select
                    value={remote}
                    onChange={event => setRemote(event.target.value)}
                >
                    {!remotes.length && <option value="">No remotes</option>}
                    {remotes.map(item => <option key={item.name}>{item.name}</option>)}
                </select>
                <div className={styles.inputRow}>
                    <button
                        disabled={busy || !selectedRemoteExists}
                        onClick={() => syncRemote('pull')}
                    >Pull</button>
                    <button
                        disabled={busy || !selectedRemoteExists}
                        onClick={() => syncRemote('push')}
                    >Push</button>
                </div>
            </div></>);
    } else {
        context = (<>{header('README')}<div className={styles.readmeEditor}><ReadmeEditor
            dark={props.dark}
            value={readme}
            onChange={setReadme}
        />
            <button
                className={styles.primaryButton}
                onClick={saveReadme}
            >Save README.md</button></div></>);
    }

    const showDetail = view === 'changes';
    const detail = diff ? (<ProjectDiff
        dark={props.dark}
        diff={diff}
        onClose={clearDiff}
        onShowScript={showScript}
    />) :
    <div className={styles.detailEmpty}><h2>Select a changed file</h2><p>Its diff will open here.</p></div>;

    const unavailable = !window.Git || available === false;
    const showWorkspace = Boolean(repoPath && repository);
    let modalBody;
    if (unavailable) {
        const messageId = window.Git ? messages.gitMissing : messages.desktopOnly;
        modalBody = <div className={styles.fullNotice}>{props.intl.formatMessage(messageId)}</div>;
    } else if (showWorkspace) {
        modalBody = (<>
            <aside className={styles.sidebar}>
                <nav>{navigation.map(group => {
                    const selectedGroup = group.views ?
                        group.views.some(item => item.id === view) : group.id === view;
                    return (<div
                        className={styles.navGroup}
                        key={group.id}
                    >
                        <button
                            className={selectedGroup ? styles.navActive : ''}
                            onClick={() => setView(group.views ? group.views[0].id : group.id)}
                        >
                            <span>{group.label}</span>
                            {group.id === 'changes' && changes.length > 0 && <em>{changes.length}</em>}
                        </button>
                        {selectedGroup && group.views && <div className={styles.subNavigation}>
                            {group.views.map(item => (<button
                                className={view === item.id ? styles.subNavActive : ''}
                                key={item.id}
                                onClick={() => setView(item.id)}
                            >{item.label}</button>))}
                        </div>}
                    </div>);
                })}</nav>
                <div className={styles.sidebarFooter}>
                    <div className={styles.repositoryDetails}>
                        <div><span>Branch</span><strong>{safeStatus.branch || 'Detached HEAD'}</strong></div>
                        <div><span>Commit</span><strong>{safeStatus.commit || 'No commits'}</strong></div>
                    </div>
                    <button
                        className={styles.refreshButton}
                        disabled={busy}
                        onClick={() => refresh()}
                    >Refresh</button>
                </div>
            </aside>
            <section className={`${styles.contextPane} ${showDetail ? '' : styles.contextWide}`}>
                {status && context}
            </section>
            {showDetail && <section className={styles.detailPane}>{status && detail}</section>}
        </>);
    } else {
        modalBody = (<div className={styles.compactChooser}>
            <div className={styles.compactHeading}>
                <strong>{repoPath ? 'Set up source control' : 'Git source control'}</strong>
                <span>{loading ? 'Checking the selected folder...' : repoPath ?
                    'This folder is not a Git repository yet.' :
                    'Track your NitroBolt project, review changes, and work with branches.'}</span>
            </div>
            {repoPath && <div className={styles.selectedPath}>
                <strong>Selected folder</strong>
                <span>{repoPath}</span>
            </div>}
            <p>{repoPath ?
                'Initialize this folder to begin tracking its project files and assets.' :
                'Choose a project folder that already contains a repository, or select a folder to initialize.'}</p>
            {repoPath && !loading && <button
                className={styles.refreshButton}
                disabled={busy}
                onClick={init}
            >Initialize Repository</button>}
            <button
                className={styles.pathButton}
                disabled={busy}
                onClick={chooseFolder}
            >{repoPath ? 'Choose another folder' : 'Choose folder'}</button>
        </div>);
    }
    /* eslint-enable indent, react/jsx-no-bind, react/jsx-no-literals */
    return (<Modal
        className={showWorkspace ? styles.modalContent : styles.compactModalContent}
        onRequestClose={props.onClose}
        contentLabel={props.intl.formatMessage(messages.title)}
        id="gitModal"
    >
        <Box className={showWorkspace ? styles.shell : styles.compactShell}>{modalBody}</Box>
    </Modal>);
};
GitModal.propTypes = {dark: PropTypes.bool,
    intl: intlShape.isRequired,
    onClearFileHandle: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    onShowBlocks: PropTypes.func.isRequired,
    onSetProjectPath: PropTypes.func.isRequired,
    projectPath: PropTypes.string,
    preferences: PropTypes.object.isRequired,
    vm: PropTypes.shape({loadProject: PropTypes.func.isRequired,
        quit: PropTypes.func.isRequired,
        runtime: PropTypes.shape({
            targets: PropTypes.arrayOf(PropTypes.object).isRequired
        }).isRequired,
        setEditingTarget: PropTypes.func.isRequired,
        renderer: PropTypes.shape({draw: PropTypes.func.isRequired})}).isRequired};
const mapStateToProps = state => ({
    preferences: state.scratchGui.preferences
});

export default connect(mapStateToProps)(injectIntl(GitModal));
