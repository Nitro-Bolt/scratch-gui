import PropTypes from 'prop-types';
import React, {useState, useEffect} from 'react';
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
  chooseFolder: {
    defaultMessage: 'Choose Repository Folder',
    id: 'nb.git.chooseFolder'
  },
  selectedFolder: {
    defaultMessage: 'Selected folder:',
    id: 'nb.git.selectedFolder'
  },
  initializeHere: {
    defaultMessage: 'Initialize Here',
    id: 'nb.git.initializeHere'
  }
});

const GitModal = props => {
  const [gitAvailable, setGitAvailable] = useState(false);
  const [isRepository, setIsRepository] = useState(false);
  const [branch, setBranch] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commitMessage, setCommitMessage] = useState('');
  const [isCommitting, setIsCommitting] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    if (props.projectPath) {
      setSelectedFolder(props.projectPath);
    }
  }, [props.projectPath]);

  useEffect(() => {
    checkGitAvailability();
  }, []);

  useEffect(() => {
    if (gitAvailable && (selectedFolder || props.projectPath)) {
      refreshStatus();
    }
  }, [selectedFolder, gitAvailable, props.projectPath]);

  const checkGitAvailability = async () => {
    if (!window.Git) {
      setGitAvailable(false);
      setLoading(false);
      return;
    }

    try {
      const available = await window.Git.isAvailable();
      setGitAvailable(available);

      if (available && (selectedFolder || props.projectPath)) {
        await refreshStatus();
      } else {
        setLoading(false);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const refreshStatus = async () => {
    const folder = selectedFolder || props.projectPath;
    if (!folder || !gitAvailable) return;

    try {
      setLoading(true);
      setError(null);

      const result = await window.Git.status(folder);
      if (result.success) {
        setIsRepository(result.data.isRepository);
        setBranch(result.data.branch || 'unknown');
        setStatus(result.data);
      } else {
        setIsRepository(false);
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChooseFolder = () => {
    fileInputRef.current?.click();
  };

  const handleFolderSelected = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const firstFile = files[0];

      if (firstFile.path) {
        const folderPath = firstFile.path.split('\\').slice(0, -1).join('\\');
        setSelectedFolder(folderPath);
        setTimeout(() => refreshStatus(), 500);
      }
    }
  };

  const handleInitRepository = async () => {
    const folder = selectedFolder || props.projectPath;
    if (!folder) {
      setError('Please select a folder first');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await window.Git.init(folder);
      if (result.success) {
        await refreshStatus();
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
    try {
      setLoading(true);
      const folder = selectedFolder || props.projectPath;
      const result = await window.Git.add(folder, []);
      if (result.success) {
        await refreshStatus();
      } else {
        setError(result.error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCommit = async () => {
    if (!commitMessage.trim()) {
      setError('Commit message cannot be empty');
      return;
    }

    try {
      setIsCommitting(true);
      const folder = selectedFolder || props.projectPath;
      const result = await window.Git.commit(folder, commitMessage);
      if (result.success) {
        setCommitMessage('');
        await refreshStatus();
      } else {
        setError(result.error);
      }
    } finally {
      setIsCommitting(false);
    }
  };

  const handleDiscardFile = async file => {
    try {
      setLoading(true);
      const folder = selectedFolder || props.projectPath;
      const result = await window.Git.discard(folder, file);
      if (result.success) {
        await refreshStatus();
      } else {
        setError(result.error);
      }
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

  if (!isRepository && !loading) {
    const isUserSelectedFolder = selectedFolder && selectedFolder !== props.projectPath;

    return (
      <Modal
        className={styles.modalContent}
        onRequestClose={props.onClose}
        contentLabel={props.intl.formatMessage(messages.title)}
        id="gitModal"
      >
        <Box className={styles.body}>
          {isUserSelectedFolder ? (
            <div>
              <p>{props.intl.formatMessage(messages.selectedFolder)} <br /> <strong>{selectedFolder}</strong></p>
              <p>{props.intl.formatMessage(messages.notRepo)}</p>
              <button
                className={styles.button}
                onClick={handleInitRepository}
              >
                {props.intl.formatMessage(messages.initializeHere)}
              </button>
              <button
                className={styles.button}
                onClick={handleChooseFolder}
              >
                {props.intl.formatMessage(messages.chooseFolder)}
              </button>
            </div>
          ) : (
            <div>
              <p>{props.intl.formatMessage(messages.notRepo)}</p>
              <button
                className={styles.button}
                onClick={handleChooseFolder}
              >
                {props.intl.formatMessage(messages.chooseFolder)}
              </button>
            </div>
          )}
        </Box>
      </Modal>
    );
  }

  if (loading) {
    return (
      <Modal
        className={styles.modalContent}
        onRequestClose={props.onClose}
        contentLabel={props.intl.formatMessage(messages.title)}
        id="gitModal"
      >
        <Box className={styles.body}>
          <div className={styles.loading}>Loading…</div>
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
      <input
        ref={fileInputRef}
        type="file"
        webkitdirectory="true"
        directory="true"
        onChange={handleFolderSelected}
        style={{display: 'none'}}
      />
      <Box className={styles.body}>
        <div className={styles.header}>
          {props.intl.formatMessage(messages.title)}
          <span className={styles.branch}>📍 {branch}</span>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {status && (
          <div className={styles.section}>
            <h3>Changes</h3>

            {status.unstaged.map(file => (
              <div key={file} className={styles.fileItem}>
                <span>{file}</span>
                <button onClick={() => handleDiscardFile(file)}>
                  Discard
                </button>
              </div>
            ))}

            {status.untracked.map(file => (
              <div key={file} className={styles.fileItem}>
                <span>{file}</span>
              </div>
            ))}
          </div>
        )}

        {(status.unstaged.length > 0 || status.untracked.length > 0) && (
          <div className={styles.section}>
            <textarea
              value={commitMessage}
              onChange={e => setCommitMessage(e.target.value)}
              placeholder="Enter commit message…"
            />
            <button onClick={handleAddAll}>Stage All</button>
            <button onClick={handleCommit} disabled={isCommitting}>
              Commit
            </button>
          </div>
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