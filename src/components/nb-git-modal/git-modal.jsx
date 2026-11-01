import PropTypes from 'prop-types';
import React, {useEffect, useMemo, useState} from 'react';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import {connect} from 'react-redux';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import Modal from '../../containers/modal.jsx';
import Box from '../box/box.jsx';
import dropdownCaret from '../menu-bar/dropdown-caret.svg';
import FancyDropdown from '../nb-fancy-dropdown/dropdown.jsx';
import ProjectDiff from './project-diff.jsx';
import log from '../../lib/log';
import LazyScratchBlocks from '../../lib/tw-lazy-scratch-blocks';
import {markGitProjectLoaded, pauseGitProjectSync, requestGitProjectSync,
    resumeGitProjectSync} from '../../containers/nb-git-project-manager.jsx';
import styles from './git-modal.css';

const messages = defineMessages({
    title: {defaultMessage: 'Source Control', id: 'nb.git.title'},
    general: {defaultMessage: 'General', id: 'nb.git.general'},
    branches: {defaultMessage: 'Branches', id: 'nb.git.branches'},
    remotes: {defaultMessage: 'Remotes', id: 'nb.git.remotes'},
    history: {defaultMessage: 'History', id: 'nb.git.history'},
    controls: {defaultMessage: 'Merging & Controls', id: 'nb.git.controls'},
    changes: {defaultMessage: 'Changes', id: 'nb.git.changes'},
    readme: {defaultMessage: 'README', id: 'nb.git.readme'},
    gitOperationFailed: {defaultMessage: 'Git operation failed.', id: 'nb.git.operationFailed'},
    dismissError: {defaultMessage: 'Dismiss error', id: 'nb.git.dismissError'},
    unstageAll: {defaultMessage: 'Unstage all', id: 'nb.git.unstageAll'},
    stageAll: {defaultMessage: 'Stage all', id: 'nb.git.stageAll'},
    discardAll: {defaultMessage: 'Discard all changes', id: 'nb.git.discardAll'},
    confirmDiscardAll: {defaultMessage: 'Click again to confirm discard all', id: 'nb.git.confirmDiscardAll'},
    confirm: {defaultMessage: 'Click again to confirm', id: 'nb.git.confirm'},
    confirmButton: {defaultMessage: 'Confirm', id: 'nb.git.confirmButton'},
    undoChange: {defaultMessage: 'Undo change', id: 'nb.git.undoChange'},
    discardManaged: {
        defaultMessage: 'Use Discard all to remove this project change safely',
        id: 'nb.git.discardManaged'
    },
    unstage: {defaultMessage: 'Unstage', id: 'nb.git.unstage'},
    stage: {defaultMessage: 'Stage', id: 'nb.git.stage'},
    staged: {defaultMessage: 'Staged', id: 'nb.git.staged'},
    conflicts: {defaultMessage: 'Conflicts', id: 'nb.git.conflicts'},
    workingTreeClean: {defaultMessage: 'Working tree clean', id: 'nb.git.workingTreeClean'},
    changedFiles: {
        defaultMessage: '{count, plural, one {# changed file} other {# changed files}}',
        id: 'nb.git.changedFiles'
    },
    commitMessage: {defaultMessage: 'Commit message', id: 'nb.git.commitMessage'},
    commit: {defaultMessage: 'Commit', id: 'nb.git.commit'},
    moreCommitActions: {defaultMessage: 'More commit actions', id: 'nb.git.moreCommitActions'},
    commitAmend: {defaultMessage: 'Commit (Amend)', id: 'nb.git.commitAmend'},
    commitPush: {defaultMessage: 'Commit & Push', id: 'nb.git.commitPush'},
    commitSync: {defaultMessage: 'Commit & Sync', id: 'nb.git.commitSync'},
    enterCommitMessage: {defaultMessage: 'Enter a commit message.', id: 'nb.git.enterCommitMessage'},
    newBranch: {defaultMessage: 'New branch', id: 'nb.git.newBranch'},
    branchPlaceholder: {defaultMessage: 'feature/name', id: 'nb.git.branchPlaceholder'},
    create: {defaultMessage: 'Create', id: 'nb.git.create'},
    local: {defaultMessage: 'Local', id: 'nb.git.local'},
    remote: {defaultMessage: 'Remote', id: 'nb.git.remote'},
    noLocalBranches: {defaultMessage: 'No local branches', id: 'nb.git.noLocalBranches'},
    noRemoteBranches: {defaultMessage: 'No remote branches', id: 'nb.git.noRemoteBranches'},
    save: {defaultMessage: 'Save', id: 'nb.git.save'},
    cancel: {defaultMessage: 'Cancel', id: 'nb.git.cancel'},
    current: {defaultMessage: 'current', id: 'nb.git.current'},
    rename: {defaultMessage: 'Rename', id: 'nb.git.rename'},
    delete: {defaultMessage: 'Delete', id: 'nb.git.delete'},
    enterBranchName: {defaultMessage: 'Enter a branch name.', id: 'nb.git.enterBranchName'},
    addRemote: {defaultMessage: 'Add remote', id: 'nb.git.addRemote'},
    remove: {defaultMessage: 'Remove', id: 'nb.git.remove'},
    enterRemote: {defaultMessage: 'Enter a remote name and URL.', id: 'nb.git.enterRemote'},
    revertCommit: {defaultMessage: 'Revert to this commit', id: 'nb.git.revertCommit'},
    mergeBranch: {defaultMessage: 'Merge branch', id: 'nb.git.mergeBranch'},
    chooseSource: {defaultMessage: 'Choose source branch…', id: 'nb.git.chooseSource'},
    intoBranch: {defaultMessage: 'Into branch', id: 'nb.git.intoBranch'},
    chooseDestination: {defaultMessage: 'Choose destination branch…', id: 'nb.git.chooseDestination'},
    merge: {defaultMessage: 'Merge', id: 'nb.git.merge'},
    remoteSync: {defaultMessage: 'Remote sync', id: 'nb.git.remoteSync'},
    noRemotes: {defaultMessage: 'No remotes', id: 'nb.git.noRemotes'},
    pull: {defaultMessage: 'Pull', id: 'nb.git.pull'},
    push: {defaultMessage: 'Push', id: 'nb.git.push'},
    saveReadme: {defaultMessage: 'Save README.md', id: 'nb.git.saveReadme'},
    selectChangedFile: {defaultMessage: 'Select a changed file', id: 'nb.git.selectChangedFile'},
    diffHint: {defaultMessage: 'Its diff will open here.', id: 'nb.git.diffHint'},
    branch: {defaultMessage: 'Branch', id: 'nb.git.branch'},
    detachedHead: {defaultMessage: 'Detached HEAD', id: 'nb.git.detachedHead'},
    commitLabel: {defaultMessage: 'Commit', id: 'nb.git.commitLabel'},
    noCommits: {defaultMessage: 'No commits', id: 'nb.git.noCommits'},
    refresh: {defaultMessage: 'Refresh', id: 'nb.git.refresh'}
});
const navigation = [
    {
        id: 'general',
        message: messages.general,
        views: [
            {id: 'branches', message: messages.branches},
            {id: 'remotes', message: messages.remotes},
            {id: 'history', message: messages.history},
            {id: 'controls', message: messages.controls}
        ]
    },
    {id: 'changes', message: messages.changes},
    {id: 'readme', message: messages.readme}
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

const gitErrorMessage = result => result && result.error;
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
    const repoPath = props.projectPath;
    const [status, setStatus] = useState(null);
    const [branches, setBranches] = useState([]);
    const [remotes, setRemotes] = useState([]);
    const [history, setHistory] = useState([]);
    const [view, setView] = useState('changes');
    const [generalView, setGeneralView] = useState('branches');
    const [diff, setDiff] = useState(null);
    const [selected, setSelected] = useState(null);
    const [discardPath, setDiscardPath] = useState(null);
    const [discardAllPending, setDiscardAllPending] = useState(false);
    const [busy, setBusy] = useState(false);
    const [operationError, setOperationError] = useState('');
    const [message, setMessage] = useState('');
    const [commitMenuOpen, setCommitMenuOpen] = useState(false);
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
    const commitMenu = React.useRef(null);
    const commitMenuButton = React.useRef(null);
    const repositoryRevision = status && status.isRepository ? `${repoPath}:${status.commit || 'unborn'}` : null;
    const safeStatus = status || {branch: '', commit: null, staged: []};

    const format = (descriptor, values) => props.intl.formatMessage(descriptor, values);
    const errorMessage = result => gitErrorMessage(result) || format(messages.gitOperationFailed);
    const failed = result => {
        if (result && result.success) return false;
        const nextError = errorMessage(result);
        setOperationError(nextError);
        log.error(nextError);
        return true;
    };
    const clearDiff = () => {
        diffRequest.current++;
        setDiff(null);
        setSelected(null);
    };
    const refresh = async (path = repoPath, fetchRemotes = false) => {
        const request = ++refreshRequest.current;
        if (!path) return;
        try {
            const result = await window.Git.status(path);
            if (request !== refreshRequest.current) return;
            if (failed(result)) return;
            if (!result.data.isRepository) {
                setStatus(null);
                setBranches([]);
                setRemotes([]);
                setHistory([]);
                clearDiff();
                setReadmeRevision(null);
                setOperationError(format(messages.gitOperationFailed));
                return;
            }
            setStatus(result.data);
            if (fetchRemotes) {
                const fetchResult = await window.Git.fetch(path);
                if (request !== refreshRequest.current) return;
                failed(fetchResult);
            }
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
        }
    };
    useEffect(() => {
        if (!commitMenuOpen) return () => null;
        const closeMenu = event => {
            if (event.type === 'keydown' && event.key !== 'Escape') return;
            if (event.type === 'mousedown' && commitMenu.current && commitMenu.current.contains(event.target)) return;
            setCommitMenuOpen(false);
        };
        document.addEventListener('mousedown', closeMenu);
        document.addEventListener('keydown', closeMenu);
        return () => {
            document.removeEventListener('mousedown', closeMenu);
            document.removeEventListener('keydown', closeMenu);
        };
    }, [commitMenuOpen]);
    useEffect(() => {
        if (!commitMenuOpen || !commitMenu.current) return;
        const firstAction = commitMenu.current.querySelector('[role="menuitem"]:not(:disabled)');
        if (firstAction) firstAction.focus();
    }, [commitMenuOpen]);
    useEffect(() => {
        refresh(repoPath, true);
    }, [repoPath]);
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
        setOperationError('');
        setBusy(true);
        return Promise.resolve()
            .then(action)
            .catch(nextError => {
                const nextMessage = nextError && nextError.message ? nextError.message : String(nextError);
                setOperationError(nextMessage);
                log.error(nextError);
            })
            .then(() => {
                actionRunning.current = false;
                setBusy(false);
            });
    };
    const reloadProject = async (path = repoPath) => {
        const result = await window.Git.readProject(path);
        if (!result || !result.success) throw new Error(errorMessage(result));
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
            if (!result || !result.success) throw new Error(errorMessage(result));
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
                if (!result || !result.success) throw new Error(errorMessage(result));
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
    const toggleCommitMenu = async () => {
        const opening = !commitMenuOpen;
        setCommitMenuOpen(opening);
        if (!opening || !props.preferences['git-fill-previous-commit-message'] ||
            message.trim() || !status || !status.commit) return;
        try {
            const result = await window.Git.commitMessage(repoPath);
            if (failed(result)) return;
            setMessage(result.message.trim());
        } catch (nextError) {
            const nextMessage = nextError && nextError.message ? nextError.message : String(nextError);
            setOperationError(nextMessage);
            log.error(nextError);
        }
    };
    const handleCommitMenuKeyDown = event => {
        if (!commitMenu.current) return;
        const actions = Array.from(commitMenu.current.querySelectorAll('[role="menuitem"]:not(:disabled)'));
        if (!actions.length) return;
        const currentIndex = actions.indexOf(document.activeElement);
        let nextIndex;
        if (event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % actions.length;
        else if (event.key === 'ArrowUp') nextIndex = (currentIndex - 1 + actions.length) % actions.length;
        else if (event.key === 'Home') nextIndex = 0;
        else if (event.key === 'End') nextIndex = actions.length - 1;
        else if (event.key === 'Escape') {
            setCommitMenuOpen(false);
            commitMenuButton.current.focus();
            event.preventDefault();
            return;
        } else if (event.key === 'Tab') {
            setCommitMenuOpen(false);
            return;
        } else return;
        actions[nextIndex].focus();
        event.preventDefault();
    };
    const commit = (action = 'commit') => run(async () => {
        if (!message.trim()) throw new Error(format(messages.enterCommitMessage));
        const restoreMenuFocus = commitMenuOpen;
        setCommitMenuOpen(false);
        if (restoreMenuFocus) setTimeout(() => commitMenuButton.current && commitMenuButton.current.focus(), 0);
        const result = await window.Git.commit(repoPath, message.trim(), action === 'amend');
        if (failed(result)) return;
        setMessage('');
        try {
            if (action === 'push') {
                const pushResult = await window.Git.push(repoPath, remote, safeStatus.branch);
                if (failed(pushResult)) return;
            } else if (action === 'sync') {
                let paused = false;
                try {
                    await pauseGitProjectSync();
                    paused = true;
                    const fetchResult = await window.Git.fetch(repoPath, remote);
                    if (failed(fetchResult)) return;
                    const pullResult = await window.Git.pull(repoPath, remote, safeStatus.branch);
                    if (failed(pullResult)) return;
                    await reloadProject();
                    const pushResult = await window.Git.push(repoPath, remote, safeStatus.branch);
                    if (failed(pushResult)) return;
                } finally {
                    if (paused) resumeGitProjectSync();
                }
            }
        } finally {
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
        if (!branchName.trim()) throw new Error(format(messages.enterBranchName));
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
        if (!remoteName.trim() || !remoteUrl.trim()) throw new Error(format(messages.enterRemote));
        const result = await window.Git.addRemote(repoPath, remoteName.trim(), remoteUrl.trim());
        if (!failed(result)) {
            setRemoteUrl('');
            await refresh(repoPath, true);
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
    const syncRemote = method => run(async () => {
        let paused = false;
        try {
            if (method === 'pull') {
                await pauseGitProjectSync();
                paused = true;
                const fetchResult = await window.Git.fetch(repoPath, remote);
                if (failed(fetchResult)) return;
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
    const fileGroups = [
        {id: 'Staged', message: messages.staged},
        {id: 'Conflicts', message: messages.conflicts},
        {id: 'Changes', message: messages.changes}
    ];
    const filesPane = (<div className={styles.fileGroups}>{fileGroups.map(group => {
        const files = changes.filter(item => item.group === group.id);
        return files.length ? <section
            className={styles.fileGroup}
            key={group.id}
        >
            <div className={styles.groupHeading}><span>{format(group.message)}</span>
                <span className={styles.groupCount}>{files.length}
                    {group.id === 'Staged' && <button
                        title={format(messages.unstageAll)}
                        onClick={() => mutate('reset', [])}
                    >−</button>}
                    {group.id === 'Changes' && <button
                        title={format(messages.stageAll)}
                        onClick={() => mutate('add', [])}
                    >+</button>}
                    {group.id === 'Changes' && <button
                        title={format(discardAllPending ? messages.confirmDiscardAll : messages.discardAll)}
                        onClick={discardAllChanges}
                    >{discardAllPending ? '!' : '↶'}</button>}
                </span></div>
            {files.map(item => (<div
                className={`${styles.fileItem} ${selected === `${item.staged ? 's' : 'w'}:${item.path}` ?
                    styles.fileItemActive : ''}`}
                key={`${group.id}:${item.path}`}
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
                    title={format(canDiscardIndividually(item) ?
                        (discardPath === item.path ? messages.confirm : messages.undoChange) :
                        messages.discardManaged)}
                    onClick={() => discardChange(item)}
                >{discardPath === item.path ? '!' : '↶'}</button>}
                <button
                    className={styles.inlineAction}
                    title={format(item.staged ? messages.unstage : messages.stage)}
                    onClick={() => mutate(item.staged ? 'reset' : 'add',
                        [item.path, item.originalPath].filter(Boolean))}
                >{item.staged ? '−' : '+'}</button>
            </div>))}</section> : null;
    })}{!changes.length && <div className={styles.emptyState}>{format(messages.workingTreeClean)}</div>}</div>);

    const header = (title, subtitle) => (<div className={styles.paneHeader}><div><h3>{title}</h3>
        {subtitle && <p>{subtitle}</p>}</div></div>);
    let context;
    if (view === 'changes') {
        context = (<>{header(format(messages.changes), format(messages.changedFiles, {count: changes.length}))}
            <div className={styles.commitBox}><textarea
                className={styles.commitInput}
                value={message}
                onChange={event => setMessage(event.target.value)}
                placeholder={format(messages.commitMessage)}
            />
                <div
                    className={styles.commitActions}
                    ref={commitMenu}
                >
                    <button
                        className={styles.commitMainButton}
                        disabled={busy || !safeStatus.staged.length || !message.trim()}
                        onClick={() => commit()}
                    >{format(messages.commit)}</button>
                    <button
                        aria-expanded={commitMenuOpen}
                        aria-haspopup="menu"
                        aria-label={format(messages.moreCommitActions)}
                        className={styles.commitMenuButton}
                        disabled={busy}
                        onClick={toggleCommitMenu}
                        ref={commitMenuButton}
                    ><img
                        alt=""
                        draggable={false}
                        height={5}
                        src={dropdownCaret}
                        width={8}
                    /></button>
                    {commitMenuOpen && <div
                        className={styles.commitMenu}
                        onKeyDown={handleCommitMenuKeyDown}
                        role="menu"
                    >
                        <button
                            disabled={!safeStatus.staged.length || !message.trim()}
                            onClick={() => commit('commit')}
                            role="menuitem"
                        >{format(messages.commit)}</button>
                        <button
                            disabled={!safeStatus.commit || !message.trim()}
                            onClick={() => commit('amend')}
                            role="menuitem"
                        >{format(messages.commitAmend)}</button>
                        <button
                            className={styles.commitRemoteAction}
                            disabled={!safeStatus.staged.length || !message.trim() || !selectedRemoteExists}
                            onClick={() => commit('push')}
                            role="menuitem"
                        >{format(messages.commitPush)}</button>
                        <button
                            disabled={!safeStatus.staged.length || !message.trim() || !selectedRemoteExists}
                            onClick={() => commit('sync')}
                            role="menuitem"
                        >{format(messages.commitSync)}</button>
                    </div>}
                </div>
            </div>{filesPane}</>);
    } else if (view === 'branches') {
        context = (<>{header(format(messages.branches))}<div className={styles.formCard}>
            <label>{format(messages.newBranch)}</label>
            <div className={styles.inputRow}><input
                value={branchName}
                onChange={event => setBranchName(event.target.value)}
                placeholder={format(messages.branchPlaceholder)}
            /><button
                className={styles.primaryButton}
                disabled={busy || !branchName.trim()}
                onClick={createBranch}
            >{format(messages.create)}</button></div></div>
            {[
                [messages.local, messages.noLocalBranches, local],
                [messages.remote, messages.noRemoteBranches, remoteBranches]
            ].map(([label, emptyLabel, items]) => (<div
                className={styles.listSection}
                key={label.id}
            ><h4>{format(label)}</h4>
                <div className={styles.branchList}>
                    {!items.length && <div className={styles.emptyList}>{format(emptyLabel)}</div>}
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
                            >{format(messages.save)}</button>
                            <button onClick={() => setRenamingBranch(null)}>{format(messages.cancel)}</button>
                        </> : <>
                            <button
                                className={styles.listItem}
                                onClick={() => !item.isCurrent && switchBranch(item.ref)}
                            ><span>{item.name}</span>{item.isCurrent && <em>{format(messages.current)}</em>}</button>
                            {!item.isRemote && <button
                                onClick={() => {
                                setRenamingBranch(item);
                                setRenamedBranch(item.name);
                            }}
                            >{format(messages.rename)}</button>}
                            <button
                                disabled={item.isCurrent}
                                onClick={() => {
                                if (deleteBranchRef === item.ref) deleteBranch(item);
                                else setDeleteBranchRef(item.ref);
                            }}
                            >{format(deleteBranchRef === item.ref ? messages.confirmButton : messages.delete)}</button>
                        </>}
                    </div>))}
                </div></div>))}</>);
    } else if (view === 'remotes') {
        context = (<>{header(format(messages.remotes))}<div className={styles.formCard}>
            <label>{format(messages.addRemote)}</label><input
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
            >{format(messages.addRemote)}</button></div>
            <div className={styles.listSection}>{remotes.map(item => (
                <div
                    className={styles.remoteItem}
                    key={item.name}
                >
                    <div><strong>{item.name}</strong><span>{item.fetch || item.push}</span></div>
                    <button onClick={() => removeRemote(item.name)}>{format(messages.remove)}</button>
                </div>
            ))}</div></>);
    } else if (view === 'history') {
        context = (<>{header(format(messages.history))}<div className={styles.historyList}>{history.map(item =>
            (<div
                className={styles.commitItem}
                key={item.hash}
            ><div><strong>{item.subject}</strong>
                <span>{item.shortHash} · {item.author}</span>
                <small>{item.branch} · {item.relativeDate}</small>
                {item.shortHash !== safeStatus.commit && <button
                    className={styles.revertButton}
                    onClick={() => revertToCommit(item.hash)}
                >{format(messages.revertCommit)}</button>}</div></div>))}</div></>);
    } else if (view === 'controls') {
        context = (<>{header(format(messages.controls))}<div className={styles.formCard}>
            <label>{format(messages.mergeBranch)}</label><FancyDropdown
                className={styles.selectWrapper}
                value={mergeBranch}
                onChange={event => setMergeBranch(event.target.value)}
            >
                <option value="">{format(messages.chooseSource)}</option>{branches.map(item =>
                    (<option
                        value={item.ref}
                        key={item.ref}
                    >{item.name}</option>))}</FancyDropdown>
            <label>{format(messages.intoBranch)}</label><FancyDropdown
                className={styles.selectWrapper}
                value={mergeTarget}
                onChange={event => setMergeTarget(event.target.value)}
            >
                <option value="">{format(messages.chooseDestination)}</option>
                {local.filter(item => item.ref !== mergeBranch).map(item => (
                    <option
                        value={item.ref}
                        key={item.ref}
                    >{item.name}</option>
                ))}
            </FancyDropdown>
            <button
                className={styles.primaryButton}
                disabled={!mergeBranch || !mergeTarget || mergeBranch === mergeTarget}
                onClick={merge}
            >{format(messages.merge)}</button></div><div className={styles.formCard}>
                <label>{format(messages.remoteSync)}</label><FancyDropdown
                    className={styles.selectWrapper}
                    value={remote}
                    onChange={event => setRemote(event.target.value)}
                >
                    {!remotes.length && <option value="">{format(messages.noRemotes)}</option>}
                    {remotes.map(item => <option key={item.name}>{item.name}</option>)}
                </FancyDropdown>
                <div className={styles.inputRow}>
                    <button
                        disabled={busy || !selectedRemoteExists}
                        onClick={() => syncRemote('pull')}
                    >{format(messages.pull)}</button>
                    <button
                        disabled={busy || !selectedRemoteExists}
                        onClick={() => syncRemote('push')}
                    >{format(messages.push)}</button>
                </div>
            </div></>);
    } else {
        context = (<>{header(format(messages.readme))}<div className={styles.readmeEditor}><ReadmeEditor
            dark={props.dark}
            value={readme}
            onChange={setReadme}
        />
            <button
                className={styles.primaryButton}
                onClick={saveReadme}
            >{format(messages.saveReadme)}</button></div></>);
    }

    const showDetail = view === 'changes';
    const detail = diff ? (<ProjectDiff
        dark={props.dark}
        diff={diff}
        onClose={clearDiff}
        onShowScript={showScript}
        vm={props.vm}
    />) : (
        <div className={styles.detailEmpty}><h2>{format(messages.selectChangedFile)}</h2>
            <p>{format(messages.diffHint)}</p></div>
    );

    const errorNotice = operationError && <div
        className={styles.errorNotice}
        role="alert"
    >
        <span>{operationError}</span>
        <button
            aria-label={format(messages.dismissError)}
            onClick={() => setOperationError('')}
        >×</button>
    </div>;
    const modalBody = (<>
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
                            onClick={() => setView(group.views ? generalView : group.id)}
                        >
                            <span>{format(group.message)}</span>
                            {group.id === 'changes' && changes.length > 0 && <em>{changes.length}</em>}
                        </button>
                        {group.views && <div
                            className={`${styles.subNavigation} ${selectedGroup ? styles.subNavigationOpen : ''}`}
                        >
                            <div className={styles.subNavigationInner}>
                                {group.views.map(item => (<button
                                    className={view === item.id ? styles.subNavActive : ''}
                                    key={item.id}
                                    onClick={() => {
                                    setGeneralView(item.id);
                                    setView(item.id);
                                }}
                                >{format(item.message)}</button>))}
                            </div>
                        </div>}
                    </div>);
                })}</nav>
            <div className={styles.sidebarFooter}>
                <div className={styles.repositoryDetails}>
                    <div><span>{format(messages.branch)}</span>
                        <strong>{safeStatus.branch || format(messages.detachedHead)}</strong></div>
                    <div><span>{format(messages.commitLabel)}</span>
                        <strong>{safeStatus.commit || format(messages.noCommits)}</strong></div>
                </div>
                <button
                    className={styles.refreshButton}
                    disabled={busy}
                    onClick={() => refresh(repoPath, true)}
                >{format(messages.refresh)}</button>
            </div>
        </aside>
        <section className={`${styles.contextPane} ${showDetail ? '' : styles.contextWide}`}>
            {errorNotice}
            {status && context}
        </section>
        {showDetail && <section className={styles.detailPane}>{status && detail}</section>}
    </>);
    /* eslint-enable indent, react/jsx-no-bind, react/jsx-no-literals */
    return (<Modal
        className={styles.modalContent}
        onRequestClose={props.onClose}
        contentLabel={props.intl.formatMessage(messages.title)}
        id="gitModal"
    >
        <Box className={styles.shell}>{modalBody}</Box>
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
