import React from 'react';
import PropTypes from 'prop-types';
import styles from './timers.css';

const formatTime = ms => {
    if (ms === null || typeof ms !== 'number') return '-';
    if (ms < 1000) return `${ms.toFixed(2)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
};

const TimersTab = React.memo(props => {
    const timerNames = Object.keys(props.timers);

    return (
        <div className={styles.container}>
            {timerNames.length > 0 ? (
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>{'Timer'}</th>
                            <th>{'Min'}</th>
                            <th>{'Max'}</th>
                            <th>{'Average'}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {timerNames.map((name, i) => (
                            <tr key={i}>
                                <td className={styles.timerName}>{name}</td>
                                <td>{formatTime(props.timers[name].min)}</td>
                                <td>{formatTime(props.timers[name].max)}</td>
                                <td>{formatTime(props.timers[name].average)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <span className={styles.noTimers}>{'No timers running'}</span>
            )}
        </div>
    );
});

TimersTab.displayName = 'TimersTab';

TimersTab.propTypes = {
    timers: PropTypes.objectOf(
        PropTypes.shape({
            min: PropTypes.number,
            max: PropTypes.number,
            average: PropTypes.number
        })
    )
};

export default TimersTab;
