import React from 'react';
import {ContextMenu, MenuItem, SubMenu} from 'react-contextmenu';
import classNames from 'classnames';

import dropdownCaret from './dropdown-caret.svg';
import styles from './context-menu.css';

const StyledContextMenu = props => (
    <ContextMenu
        {...props}
        className={styles.contextMenu}
    />
);

const StyledMenuItem = props => (
    <MenuItem
        {...props}
        attributes={{className: styles.menuItem}}
    />
);

const StyledSubMenu = props => (
    <SubMenu
        {...props}
        title={<div className={styles.subMenu}>
            {props.title}
            <img
                src={dropdownCaret}
                draggable={false}
                width={8}
                height={5}
            />
        </div>}
    />
)

const subMenuProps = {
    attributes: {
        className: styles.menuItem
    },
    className: classNames(styles.contextMenu, styles.subMenuContext)
};

const BorderedMenuItem = props => (
    <MenuItem
        {...props}
        attributes={{className: classNames(styles.menuItem, styles.menuItemBordered)}}
    />
);

const DangerousMenuItem = props => (
    <MenuItem
        {...props}
        attributes={{className: classNames(styles.menuItem, styles.menuItemBordered, styles.menuItemDanger)}}
    />
);

const UnborderedDangerousMenuItem = props => (
    <MenuItem
        {...props}
        attributes={{className: classNames(styles.menuItem, styles.menuItemDanger)}}
    />
);


export {
    BorderedMenuItem,
    DangerousMenuItem,
    UnborderedDangerousMenuItem,
    StyledContextMenu as ContextMenu,
    StyledMenuItem as MenuItem,
    StyledSubMenu as SubMenu,
    subMenuProps
};
