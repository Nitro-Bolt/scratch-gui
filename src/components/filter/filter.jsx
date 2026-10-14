import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import TWRenderRecoloredImage from '../../lib/tw-recolor/render.jsx';
import filterIcon from './icon--filter.svg?recolor';
import xIcon from './icon--x.svg?recolor';
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
            />
            <input
                className={classNames(styles.filterInput, inputClassName)}
                placeholder={placeholderText}
                type="text"
                value={filterQuery}
                onChange={onChange}
            />
            <div
                className={styles.xIconWrapper}
                onClick={onClear}
            >
                <TWRenderRecoloredImage
                    className={styles.xIcon}
                    src={xIcon}
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
