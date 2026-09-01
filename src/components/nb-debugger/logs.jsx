import React, {useState, useMemo, useEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import styles from './logs.css';

import downloadBlob from '../../lib/download-blob';

import deleteIcon from './icons/icon--delete.svg';
import downloadIcon from './icons/icon--download.svg';
import warningIcon from './icons/icon--warning.svg';
import errorIcon from './icons/icon--error.svg';
import { FormattedMessage } from 'react-intl';

const parseLogColor = color => {
    if (!color) return null;
    return `rgba(${color.r},${color.g},${color.b},1)`;
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

    const blob = new Blob([exported], {type: 'text/plain'});
    downloadBlob('logs.txt', blob);
};

const Log = React.memo(props => {
    const icon = props.type === 'warn' ? warningIcon : errorIcon;
    const color = parseLogColor(props.color);
    const colorStyle = color ? {
        backgroundColor: color.replace(',1)', ',0.15)'),
        borderBottomColor: color.replace(',1)', ',0.30)')
    } : null;
    return (
        <div
            className={classNames(styles.log, styles[props.type])}
            style={colorStyle}
        >
            {props.type && props.type !== 'log' &&
                <img src={icon} />
            }
            <span>{props.message}</span>
            {props.target &&
                <a
                    className={styles.spriteName}
                    onClick={props.onSelectTarget}
                >
                    {props.target.sprite.name}
                </a>
            }
        </div>
    );
});

Log.propTypes = {
    type: PropTypes.string,
    message: PropTypes.string,
    color: PropTypes.shape({
        r: PropTypes.number,
        g: PropTypes.number,
        b: PropTypes.number
    }),
    target: PropTypes.shape({
        sprite: PropTypes.shape({
            name: PropTypes.string
        })
    }),
    onSelectTarget: PropTypes.func
};

Log.displayName = 'Log';

const LogsTab = React.memo(props => {
    const [spriteFilter, setSpriteFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [stringFilter, setStringFilter] = useState('');
    const [isAtBottom, setIsAtBottom] = useState(true);
    const containerRef = useRef(null);

    const handleScroll = () => {
        const el = containerRef.current;
        if (!el) return;
        const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        setIsAtBottom(distanceFromBottom < 50);
    };

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        el.addEventListener('scroll', handleScroll);
        return () => el.removeEventListener('scroll', handleScroll);
    }, []);

    const sprites = Object.values(props.sprites)
        .sort((a, b) => a.order - b.order)
        .map(s => s.name);

    const filteredLogs = useMemo(() => props.logs.filter(log => {
        const spriteMatch = spriteFilter === 'all' ||
            (log.target && log.target.sprite.name === spriteFilter) ||
            (spriteFilter === '__stage__' && log.target && log.target.isStage);
        const typeMatch = typeFilter === 'all' || (log.type || 'log') === typeFilter;
        const stringMatch = log.message.includes(stringFilter);
        return spriteMatch && typeMatch && stringMatch;
    }), [props.logs, spriteFilter, typeFilter, stringFilter]);

    useEffect(() => {
        const el = containerRef.current;
        if (el && isAtBottom) {
            el.scrollTop = el.scrollHeight;
        }
    }, [filteredLogs, isAtBottom]);

    return (
        <div
            className={styles.container}
            ref={containerRef}
        >
            <div className={styles.buttonContainer}>
                <button onClick={props.onClearLogs}>
                    <img src={deleteIcon} />
                    <span>{'Clear'}</span>
                </button>
                {/* eslint-disable-next-line react/jsx-no-bind */}
                <button onClick={() => handleExportLogs(props.logs)}>
                    <img src={downloadIcon} />
                    <span>{'Export'}</span>
                </button>
                <select
                    className={styles.filterSelect}
                    value={spriteFilter}
                    // eslint-disable-next-line react/jsx-no-bind
                    onChange={e => setSpriteFilter(e.target.value)}
                >
                    <option value="all">{'All sprites'}</option>
                    {sprites.map((name, i) => (
                        <option
                            key={i}
                            value={name}
                        >
                            {name}
                        </option>
                    ))}
                    <option value="__stage__">{'Stage'}</option>
                </select>
                <select
                    className={styles.filterSelect}
                    value={typeFilter}
                    // eslint-disable-next-line react/jsx-no-bind
                    onChange={e => setTypeFilter(e.target.value)}
                >
                    <option value="all">{'All types'}</option>
                    <option value="log">{'Log'}</option>
                    <option value="warn">{'Warn'}</option>
                    <option value="error">{'Error'}</option>
                </select>
                <input
                    className={styles.search}
                    type="search"
                    value={stringFilter}
                    onChange={e => setStringFilter(e.target.value)}
                    placeholder="Search logs"
                />
            </div>
            {filteredLogs.length > 0 ? filteredLogs.map((log, i) => (
                <Log
                    key={i}
                    type={log.type}
                    message={log.message}
                    target={log.target}
                    color={log.color}
                    // eslint-disable-next-line react/jsx-no-bind
                    onSelectTarget={() => props.onSelectTarget(log.target)}
                />
            )) : (
                <span className={styles.noLogs}>{'No logs to display'}</span>
            )}
        </div>
    );
});

LogsTab.propTypes = {
    logs: PropTypes.array,
    sprites: PropTypes.object,
    onClearLogs: PropTypes.func,
    onSelectTarget: PropTypes.func
};

LogsTab.displayName = 'LogsTab';

export default LogsTab;
