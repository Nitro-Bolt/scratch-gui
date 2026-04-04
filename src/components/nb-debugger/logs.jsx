import React from 'react';
import classNames from 'classnames';
import styles from './logs.css';

import downloadBlob from '../../lib/download-blob';

import deleteIcon from './icons/icon--delete.svg';
import downloadIcon from './icons/icon--download.svg';
import warningIcon from './icons/icon--warning.svg';
import errorIcon from './icons/icon--error.svg';

const handleExportLogs = logs => {
    let exported = '';
    logs.forEach(log => {
        const type = (log.type || 'log').toUpperCase();
        if (log.target) {
            exported += `${log.target.sprite.name}: [${type}] ${log.message}\n`;
        } else {
            exported += `[${type}] ${log.message}\n`;
        }
    });

    const blob = new Blob([exported], { type: 'text/plain' });
    downloadBlob('logs.txt', blob);
};

const Log = React.memo(props => {
    const icon = props.type === 'warning' ? warningIcon : errorIcon;
    return (
        <div className={classNames(styles.log, styles[props.type])}>
            {props.type &&
                <img src={icon} />
            }
            <span>{props.message}</span>
            {props.target &&
                <a className={styles.spriteName} onClick={props.onSelectTarget}>
                    {props.target.sprite.name}
                </a>
            }
        </div>
    );
});

const LogsTab = React.memo(props => (
    <div className={styles.container}>
        {props.logs.length > 0 ? props.logs.map((log, i) => (
            <Log
                key={i}
                type={log.type}
                message={log.message}
                target={log.target}
                onSelectTarget={() => props.onSelectTarget(log.target)}
            />
        )) : (
            <h3 className={styles.noLogs}>No logs to display</h3>
        )}
        <div className={styles.buttonContainer}>
            <button onClick={props.onClearLogs}>
                <img src={deleteIcon} />
                <span>Clear</span>
            </button>
            <button onClick={() => handleExportLogs(props.logs)}>
                <img src={downloadIcon} />
                <span>Export</span>
            </button>
        </div>
    </div>
));

export default LogsTab;