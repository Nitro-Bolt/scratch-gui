import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import TWRenderRecoloredImage from '../../lib/tw-recolor/render.jsx';

import filterIcon from '!../../lib/tw-recolor/build!./icon--filter.svg';
import xIcon from '!../../lib/tw-recolor/build!./icon--x.svg';
import caseSensitiveIcon from '!../../lib/tw-recolor/build!./icon--case-sensitive.svg';
import styles from './filter.css';

const FilterComponent = props => {
    const {
        className,
        onChange,
        onClear,
        placeholderText,
        filterQuery,
        inputClassName
    } = props;

    return (
        <div
            className={classNames(className, styles.filter, {
                [styles.isActive]: filterQuery.length > 0
            })}
        >
            <TWRenderRecoloredImage
                className={styles.filterIcon}
                src={filterIcon}
                draggable={false}
            />
            <input
                className={classNames(styles.filterInput, inputClassName)}
                placeholder={placeholderText}
                type="text"
                value={filterQuery}
                onChange={onChange}
            />
            {/*<button
                className={styles.aaIconWrapper}
                onClick={() => {isCaseSensitive = !isCaseSensitive}}
            >
                <TWRenderRecoloredImage
                    className={styles.aaIcon}
                    src={caseSensitiveIcon}
                    draggable={false}
                />
            </button>*/}
            <div
                className={styles.xIconWrapper}
                onClick={onClear}
            >
                <TWRenderRecoloredImage
                    className={styles.xIcon}
                    src={xIcon}
                    draggable={false}
                />
            </div>
        </div>
    );
};

FilterComponent.propTypes = {
    className: PropTypes.string,
    filterQuery: PropTypes.string,
    inputClassName: PropTypes.string,
    onChange: PropTypes.func,
    onClear: PropTypes.func,
    placeholderText: PropTypes.string
};
FilterComponent.defaultProps = {
    placeholderText: 'Search'
};
export default FilterComponent;
