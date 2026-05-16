import React, {useState, useMemo} from 'react';
import classNames from 'classnames';
import styles from './logs.css';

import downloadBlob from '../../lib/download-blob';

import deleteIcon from './icons/icon--delete.svg';
import downloadIcon from './icons/icon--download.svg';
import warningIcon from './icons/icon--warning.svg';
import errorIcon from './icons/icon--error.svg';

const parseLogMessage = message => {
    try {
        const parsed = JSON.parse(message);
        if (parsed && typeof parsed === 'object' && '__COLOR' in parsed) {
            const { __COLOR, message } = parsed;
            const color = `rgba(${__COLOR.r},${__COLOR.g},${__COLOR.b},1)`;
            return { display: message, color };
        }
    } catch {}
    return { display: message, color: null };
};

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
    const icon = props.type === 'warn' ? warningIcon : errorIcon;
    const { display, color } = parseLogMessage(props.message);
    const colorStyle = color ? {
        color,
        backgroundColor:   color.replace(',1)',',0.15)'),
        borderBottomColor: color.replace(',1)',',0.30)')
    } : undefined;
    return (
        <div className={classNames(styles.log, styles[props.type])} style={colorStyle}>
            {props.type && props.type !== 'log' &&
                <img src={icon} />
            }
            <span style={color ? { color } : undefined}>{display}</span>
            {props.target &&
                <a className={styles.spriteName} onClick={props.onSelectTarget}>
                    {props.target.sprite.name}
                </a>
            }
        </div>
    );
});

const LogsTab = React.memo(props => {
    const [spriteFilter, setSpriteFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');

    const sprites = useMemo(() => {
        const names = new Set();
        props.logs.forEach(log => {
            if (log.target) names.add(log.target.sprite.name);
        });
        return Array.from(names).sort();
    }, [props.logs]);

    const filteredLogs = useMemo(() => {
        return props.logs.filter(log => {
            const spriteMatch = spriteFilter === 'all' ||
                (log.target && log.target.sprite.name === spriteFilter) ||
                (spriteFilter === '__stage__' && !log.target);
            const typeMatch = typeFilter === 'all' || (log.type || 'log') === typeFilter;
            return spriteMatch && typeMatch;
        });
    }, [props.logs, spriteFilter, typeFilter]);

    return (
        <div className={styles.container}>
            <div className={styles.buttonContainer}>
                <button onClick={props.onClearLogs}>
                    <img src={deleteIcon} />
                    <span>Clear</span>
                </button>
                <button onClick={() => handleExportLogs(props.logs)}>
                    <img src={downloadIcon} />
                    <span>Export</span>
                </button>
                <select
                    className={styles.filterSelect}
                    value={spriteFilter}
                    onChange={e => setSpriteFilter(e.target.value)}
                >
                    <option value="all">All sprites</option>
                    {sprites.map(name => (
                        <option key={name} value={name}>{name}</option>
                    ))}
                    {props.logs.some(l => !l.target) &&
                        <option value="__stage__">Stage</option>
                    }
                </select>
                <select
                    className={styles.filterSelect}
                    value={typeFilter}
                    onChange={e => setTypeFilter(e.target.value)}
                >
                    <option value="all">All types</option>
                    <option value="log">Log</option>
                    <option value="warn">Warn</option>
                    <option value="error">Error</option>
                </select>
            </div>
            {filteredLogs.length > 0 ? filteredLogs.map((log, i) => (
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
        </div>
    );
});

export default LogsTab;