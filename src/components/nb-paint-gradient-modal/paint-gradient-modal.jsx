/* eslint-disable max-len, no-confusing-arrow, react/jsx-no-bind, react/jsx-no-literals */
import PropTypes from 'prop-types';
import React from 'react';

import Modal from '../../containers/modal.jsx';
import Box from '../box/box.jsx';
import styles from './paint-gradient-modal.css';
import arrowIcon from './icon--arrow.svg';

const gradientToCSS = gradient => `${gradient.type}-gradient(${
    gradient.type === 'linear' ? `${gradient.angle}deg, ` : ''
}${gradient.stops.map(stop => `${stop.color} ${stop.offset * 100}%`).join(', ')})`;

const PaintGradientModal = props => {
    const update = changes => props.onChange({...props.gradient, ...changes});
    const handleStopColorChange = event => {
        const index = Number(event.currentTarget.dataset.index);
        const stops = props.gradient.stops.map((item, itemIndex) =>
            itemIndex === index ? {...item, color: event.currentTarget.value} : item);
        update({stops});
    };
    return (
        <Modal
            className={styles.modalContent}
            contentLabel="Custom Gradient"
            onRequestClose={props.onCancel}
        >
            <Box className={styles.body}>
                <div className={styles.typeSelectorContainer}>
                    <button
                        className={styles.typeSelectorButton}
                        data-active={props.gradient.type === 'linear'}
                        type="button"
                        onClick={() => update({type: 'linear'})}
                    >Linear</button>
                    <button
                        className={styles.typeSelectorButton}
                        data-active={props.gradient.type === 'radial'}
                        type="button"
                        onClick={() => update({type: 'radial'})}
                    >Radial</button>
                </div>
                <Box
                    className={styles.preview}
                    style={{backgroundImage: gradientToCSS(props.gradient)}}
                />
                {props.gradient.type === 'linear' && (
                    <label className={styles.setting}>
                        <img
                            src={arrowIcon}
                            style={{transform: `rotate(${props.gradient.angle - 90}deg)`}}
                        />
                        <input
                            max={360}
                            min={0}
                            type="number"
                            value={props.gradient.angle}
                            onChange={event => update({
                                angle: Math.max(0, Math.min(360, Number(event.target.value)))
                            })}
                        />
                        degrees
                    </label>
                )}
                <Box className={styles.cardBox}>
                    {props.gradient.stops.map((stop, index) => (
                        <Box
                            className={styles.card}
                            key={index}
                        >
                            <input
                                className={styles.colorPicker}
                                data-index={index}
                                style={{backgroundColor: stop.color}}
                                type="color"
                                value={stop.color.substr(0, 7)}
                                onChange={handleStopColorChange}
                                onInput={handleStopColorChange}
                            />
                            <input
                                max={100}
                                min={0}
                                type="number"
                                value={Math.round(stop.offset * 100)}
                                onChange={event => {
                                    const offset = Math.max(0, Math.min(100, Number(event.target.value))) / 100;
                                    const stops = props.gradient.stops.map((item, itemIndex) =>
                                        itemIndex === index ? {...item, offset} : item);
                                    update({stops});
                                }}
                            />
                            <div className={styles.deleteContainer}>
                                <button
                                    className={styles.deleteOption}
                                    disabled={props.gradient.stops.length <= 2}
                                    type="button"
                                    onClick={() => update({
                                        stops: props.gradient.stops.filter((item, itemIndex) => itemIndex !== index)
                                    })}
                                />
                            </div>
                        </Box>
                    ))}
                </Box>
                <button
                    className={styles.addButton}
                    type="button"
                    onClick={() => update({
                        stops: props.gradient.stops.concat({color: '#ffffff', offset: 0.5})
                            .sort((a, b) => a.offset - b.offset)
                    })}
                >Add color</button>
                <Box className={styles.buttonRow}>
                    <button
                        type="button"
                        onClick={props.onCancel}
                    >Cancel</button>
                    <button
                        className={styles.okButton}
                        type="button"
                        onClick={props.onOk}
                    >OK</button>
                </Box>
            </Box>
        </Modal>
    );
};

PaintGradientModal.propTypes = {
    gradient: PropTypes.shape({
        angle: PropTypes.number,
        stops: PropTypes.arrayOf(PropTypes.shape({
            color: PropTypes.string,
            offset: PropTypes.number
        })),
        type: PropTypes.oneOf(['linear', 'radial'])
    }).isRequired,
    onChange: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onOk: PropTypes.func.isRequired
};

export default PaintGradientModal;
