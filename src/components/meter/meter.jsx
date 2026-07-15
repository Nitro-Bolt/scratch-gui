import React from 'react';
import PropTypes from 'prop-types';
import styles from './meter.css';

const Meter = props => {
    const {
        level,
        width,
        height
    } = props;

    const nGreen = 11;
    const nYellow = 5;
    const nRed = 3;

    const nBars = nGreen + nYellow + nRed;

    const barSpacing = 2.5;
    const barRounding = 3;
    const barHeight = (height - (barSpacing * (nBars + 1))) / nBars;

    const nBarsToMask = Math.max(0, nBars - Math.floor(level * nBars));
    const scale = ((nBarsToMask * (barHeight + barSpacing)) + (barSpacing / 2)) / height;

    return (
        <div
            className={styles.maskContainer}
        >
            <svg
                className={styles.container}
                viewBox={`0 0 ${width} ${height}`}
            >
                {Array(nBars).fill(0)
                    .map((value, index) => (
                        <rect
                            className={index < nGreen ? styles.green :
                                (index < nGreen + nYellow ? styles.yellow : styles.red)}
                            height={barHeight}
                            key={index}
                            rx={barRounding}
                            ry={barRounding}
                            width={width - 2}
                            x={1}
                            y={height - ((barSpacing + barHeight) * (index + 1))}
                        />
                    ))}
            </svg>
            <div
                className={styles.mask}
                style={{
                    transform: `scaleY(${scale})`
                }}
            />
        </div>
    );
};

Meter.propTypes = {
    height: PropTypes.number,
    level: PropTypes.number,
    width: PropTypes.number
};

export default Meter;
