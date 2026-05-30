import React from 'react';
import PropTypes from 'prop-types';
import styles from './waveform.css';

// Waveform is expensive to compute, make sure it only updates when data does
// by using PureComponent. In future can be changed back to function with React.memo
// eslint-disable-next-line react/prefer-stateless-function
class Waveform extends React.PureComponent {
    render () {
        const {
            width,
            height,
            data,
            preferences
        } = this.props;

        // Never want a density of points higher than the number of pixels
        // This is very conservative, could be far fewer points because of curve smoothing.
        // Drawing too many points seems to cause an explosion in browser
        // composite time when animating the playhead
        const takeEveryN = Math.ceil(data.length / width);

        const filteredData = takeEveryN === 1 ? data.slice(0) :
            data.filter((_, i) => i % takeEveryN === 0);

        // Need at least two points to render waveform.
        if (filteredData.length === 1) {
            filteredData.push(filteredData[0]);
        }

        const maxIndex = filteredData.length - 1;
        const points = [
            ...filteredData.map((v, i) =>
                [width * (i / maxIndex), height * v / 2]
            ),
            ...filteredData.reverse().map((v, i) =>
                [width * (1 - (i / maxIndex)), -height * v / 2]
            )
        ];
        const pathComponents = points.map(([x, y], i) => {
            const [nx, ny] = points[i < points.length - 1 ? i + 1 : 0];
            return `${preferences?.['waveform-render-type'] === 'sharp' ?
                'L' : 'Q'}${x} ${y} ${(x + nx) / 2} ${(y + ny) / 2}`;
        });

        return (
            <>
                <svg
                    className={styles.container}
                    viewBox={`0 0 ${width} ${height}`}
                >
                    {preferences['waveform-color'] === 'volume' &&
                        <defs>
                            <linearGradient id="sound">
                                {data.map((value, i) => (
                                    <stop
                                        offset={`${i / data.length * 100}%`}
                                        stopColor={`hsl(${120 - (value * 120)} 100% 70%)`}
                                        key={i}
                                    />
                                ))}
                            </linearGradient>
                            <linearGradient id="soundOutline">
                                {data.map((value, i) => (
                                    <stop
                                        offset={`${i / data.length * 100}%`}
                                        stopColor={`hsl(${120 - (value * 120)} 50% 50%)`}
                                        key={i}
                                    />
                                ))}
                            </linearGradient>
                        </defs>
                    }
                    <g transform={`scale(1, -1) translate(0, -${height / 2})`}>
                        <path
                            className={preferences['waveform-color'] === 'volume' ? null : styles.waveformPath}
                            d={`M0 0${pathComponents.join(' ')}Z`}
                            strokeLinejoin={'round'}
                            strokeWidth={1}
                            fill="url(#sound)"
                            stroke="url(#soundOutline)"
                        />
                    </g>
                </svg>
            </>
        );
    }
}

Waveform.propTypes = {
    data: PropTypes.arrayOf(PropTypes.number),
    height: PropTypes.number,
    width: PropTypes.number,
    preferences: PropTypes.object
};

export default Waveform;
