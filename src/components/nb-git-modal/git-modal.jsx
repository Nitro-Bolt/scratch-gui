import PropTypes from 'prop-types';
import React, {useEffect, useState} from 'react';
import Modal from '../../containers/modal.jsx';
import Box from '../box/box.jsx';
import {defineMessages, injectIntl, intlShape} from 'react-intl';

import styles from './git-modal.css';

const messages = defineMessages({
  title: {
    defaultMessage: 'Git Version Control',
    description: 'Title of the Git version control modal',
    id: 'nb.git.title'
  },
  desktopOnly: {
    defaultMessage: 'Git features are only available in NitroBolt Desktop',
    id: 'nb.git.desktopOnly'
  },
  gitMissing: {
    defaultMessage: 'Git is not installed on your system. Please install Git to use version control features.',
    id: 'nb.git.missing'
  },
  notRepo: {
    defaultMessage: 'This project is not a git repository yet.',
    id: 'nb.git.notRepo'
  },
  initRepo: {
    defaultMessage: 'Initialize Repository',
    id: 'nb.git.init'
  },
  repoPath: {
    defaultMessage: 'Repository folder',
    id: 'nb.git.repoPath'
  },
  chooseFolder: {
    defaultMessage: 'Choose Folder',
    id: 'nb.git.chooseFolder'
  },
  noFolder: {
    defaultMessage: 'No folder selected',
    id: 'nb.git.noFolder'
  },
  pickFolder: {
    defaultMessage: 'Select a folder to use Git.',
    id: 'nb.git.pickFolder'
  },
  refresh: {
    defaultMessage: 'Refresh',
    id: 'nb.git.refresh'
  },
  emptyCommit: {
    defaultMessage: 'Commit message cannot be empty',
    id: 'nb.git.emptyCommit'
  },
  folderPickerUnavailable: {
    defaultMessage: 'Folder picker is only available in NitroBolt Desktop.',
    id: 'nb.git.folderPickerUnavailable'
  },
  cleanTree: {
    defaultMessage: 'Working tree clean',
    id: 'nb.git.clean'
  }
});

const GitModal = props => {
  const [gitAvailable, setGitAvailable] = useState(false);
  const [repoPath, setRepoPath] = useState(props.projectPath || '');
  const [isRepository, setIsRepository] = useState(false);
  const [branch, setBranch] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commitMessage, setCommitMessage] = useState('');
  const [isCommitting, setIsCommitting] = useState(false);

  useEffect(() => {
    checkGitAvailability();
  }, []);

  useEffect(() => {
    if (props.projectPath && props.projectPath !== repoPath) {
      setRepoPath(props.projectPath);
    }
  }, [props.projectPath, repoPath]);

  useEffect(() => {
    if (gitAvailable && repoPath) {
      refreshStatus(repoPath);
    } else if (!repoPath) {
      setStatus(null);
      setIsRepository(false);
      setBranch('');
      setLoading(false);
    }
  }, [repoPath, gitAvailable]);

  const checkGitAvailability = async () => {
    if (!window.Git) {
      setGitAvailable(false);
      setLoading(false);
      return;
    }

    try {
      const available = await window.Git.isAvailable();
      setGitAvailable(available);

      if (available && repoPath) {
        await refreshStatus(repoPath);
      } else {
        setLoading(false);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const refreshStatus = async (targetPath = repoPath) => {
    if (!targetPath || !gitAvailable) {
      setStatus(null);
      setIsRepository(false);
      setBranch('');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await window.Git.status(targetPath);
      if (result.success) {
        setIsRepository(result.data.isRepository);
        if (result.data.isRepository) {
          setBranch(result.data.branch || 'unknown');
          setStatus(result.data);
        } else {
          setBranch('');
          setStatus(null);
        }
      } else {
        setIsRepository(false);
        setBranch('');
        setStatus(null);
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDirectory = async () => {
    if (!window.EditorPreload || !window.EditorPreload.showOpenDirectoryPicker) {
      setError(props.intl.formatMessage(messages.folderPickerUnavailable));
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await window.EditorPreload.showOpenDirectoryPicker();
      if (!result || !result.path) return;

      setRepoPath(result.path);
      await refreshStatus(result.path);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const guardRepoPath = () => {
    if (!repoPath) {
      setError(props.intl.formatMessage(messages.pickFolder));
      return false;
    }
    return true;
  };

  const handleInitRepository = async () => {
    if (!guardRepoPath()) return;
    try {
      setLoading(true);
      const result = await window.Git.init(repoPath);
      if (result.success) {
        await refreshStatus(repoPath);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAll = async () => {
    if (!guardRepoPath()) return;
    try {
      setLoading(true);
      const result = await window.Git.add(repoPath, []);
      if (result.success) {
        await refreshStatus(repoPath);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCommit = async () => {
    if (!guardRepoPath()) return;
    if (!commitMessage.trim()) {
      setError(props.intl.formatMessage(messages.emptyCommit));
      return;
    }

    try {
      setIsCommitting(true);
      const result = await window.Git.commit(repoPath, commitMessage);
      if (result.success) {
        setCommitMessage('');
        await refreshStatus(repoPath);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsCommitting(false);
    }
  };

  const handleDiscardFile = async file => {
    if (!guardRepoPath()) return;
    try {
      setLoading(true);
      const result = await window.Git.discard(repoPath, file);
      if (result.success) {
        await refreshStatus(repoPath);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!window.Git) {
    return (
      <Modal
        className={styles.modalContent}
        onRequestClose={props.onClose}
        contentLabel={props.intl.formatMessage(messages.title)}
        id="gitModal"
      >
        <Box className={styles.body}>
          <div className={styles.notice}>
            {props.intl.formatMessage(messages.desktopOnly)}
          </div>
        </Box>
      </Modal>
    );
  }

  if (!gitAvailable) {
    return (
      <Modal
        className={styles.modalContent}
        onRequestClose={props.onClose}
        contentLabel={props.intl.formatMessage(messages.title)}
        id="gitModal"
      >
        <Box className={styles.body}>
          <div className={styles.notice}>
            {props.intl.formatMessage(messages.gitMissing)}
          </div>
        </Box>
      </Modal>
    );
  }

  return (
    <Modal
      className={styles.modalContent}
      onRequestClose={props.onClose}
      contentLabel={props.intl.formatMessage(messages.title)}
      id="gitModal"
    >
      <Box className={styles.body}>
        <div className={styles.header}>
          {props.intl.formatMessage(messages.title)}
          {isRepository && branch && (
            <span className={styles.branch}>📍 {branch}</span>
          )}
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            {props.intl.formatMessage(messages.repoPath)}
          </div>
          <div className={styles.pathRow}>
            <div className={styles.pathValue}>
              {repoPath || props.intl.formatMessage(messages.noFolder)}
            </div>
            <button
              className={styles.smallButton}
              onClick={handleSelectDirectory}
              disabled={loading}
            >
              {props.intl.formatMessage(messages.chooseFolder)}
            </button>
            {repoPath ? (
              <button
                className={styles.smallButton}
                onClick={() => refreshStatus()}
                disabled={loading}
              >
                {props.intl.formatMessage(messages.refresh)}
              </button>
            ) : null}
          </div>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {!repoPath && (
          <div className={styles.notice}>
            {props.intl.formatMessage(messages.pickFolder)}
          </div>
        )}

        {repoPath && loading && (
          <div className={styles.notice}>Loading…</div>
        )}

        {repoPath && !loading && !isRepository && (
          <div className={styles.section}>
            <p>{props.intl.formatMessage(messages.notRepo)}</p>
            <button
              className={styles.button}
              onClick={handleInitRepository}
              disabled={loading}
            >
              {props.intl.formatMessage(messages.initRepo)}
            </button>
          </div>
        )}

        {repoPath && !loading && isRepository && status && (
          <>
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Changes</div>

              {status.unstaged.map(file => (
                <div key={`unstaged-${file}`} className={styles.fileItem}>
                  <span className={styles.fileName}>{file}</span>
                  <button
                    className={styles.smallButton}
                    onClick={() => handleDiscardFile(file)}
                  >
                    Discard
                  </button>
                </div>
              ))}

              {status.untracked.map(file => (
                <div key={`untracked-${file}`} className={styles.fileItem}>
                  <span className={styles.fileName}>{file}</span>
                </div>
              ))}

              {status.unstaged.length === 0 && status.untracked.length === 0 && (
                <div className={styles.notice}>
                  {props.intl.formatMessage(messages.cleanTree)}
                </div>
              )}
            </div>

            {(status.unstaged.length > 0 || status.untracked.length > 0) && (
              <div className={styles.section}>
                <textarea
                  className={styles.commitInput}
                  value={commitMessage}
                  onChange={e => setCommitMessage(e.target.value)}
                  placeholder="Enter commit message…"
                />
                <div className={styles.buttonGroup}>
                  <button
                    className={styles.button}
                    onClick={handleAddAll}
                    disabled={loading}
                  >
                    Stage All
                  </button>
                  <button
                    className={styles.button}
                    onClick={handleCommit}
                    disabled={isCommitting}
                  >
                    Commit
                  </button>
                </div>
              </div>
            )}

            {status.lastCommit && (
              <div className={styles.section}>
                <div className={styles.sectionTitle}>Latest Commit</div>
                <div className={styles.lastCommit}>{status.lastCommit}</div>
              </div>
            )}
          </>
        )}
      </Box>
    </Modal>
  );
};

GitModal.propTypes = {
  intl: intlShape,
  projectPath: PropTypes.string,
  onClose: PropTypes.func.isRequired
};

export default injectIntl(GitModal);