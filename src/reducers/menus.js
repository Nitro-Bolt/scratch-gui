const OPEN_MENU = 'scratch-gui/menus/OPEN_MENU';
const CLOSE_MENU = 'scratch-gui/menus/CLOSE_MENU';

const MENU_ABOUT = 'aboutMenu';
const MENU_ACCOUNT = 'accountMenu';
const MENU_SETTINGS = 'settingsMenu';
const MENU_ACCENT = 'accentMenu';
const MENU_FILE = 'fileMenu';
const MENU_EDIT = 'editMenu';
const MENU_LANGUAGE = 'languageMenu';
const MENU_LOGIN = 'loginMenu';
const MENU_ERRORS = 'errorMenu';


const initialState = {
    [MENU_ABOUT]: false,
    [MENU_ACCOUNT]: false,
    [MENU_SETTINGS]: false,
    [MENU_ACCENT]: false,
    [MENU_FILE]: false,
    [MENU_EDIT]: false,
    [MENU_LANGUAGE]: false,
    [MENU_LOGIN]: false,
    [MENU_ERRORS]: false
};

class Menu {
    constructor (id) {
        this.id = id;
        this.children = [];
        this.parent = null;
    }

    addChild (menu) {
        this.children.push(menu);
        menu.parent = this;
        return this;
    }

    descendants () {
        return this.children.flatMap(child => [child, ...child.descendants()]);
    }

    siblings () {
        if (!this.parent) return [];

        return this.parent.children.filter(child => child.id !== this.id);
    }

    findById (id) {
        if (this.id === id) return this;

        for (const child of this.children) {
            const found = child.findById(id);
            if (found) return found;
        }

        return null;
    }
}

// Structure of nested menus, used for collapsing submenus logic.
const rootMenu = new Menu('root')
    .addChild(new Menu(MENU_ERRORS))
    .addChild(
        new Menu(MENU_SETTINGS)
            .addChild(new Menu(MENU_ACCENT))
    )
    .addChild(new Menu(MENU_FILE))
    .addChild(new Menu(MENU_EDIT))
    .addChild(new Menu(MENU_SETTINGS))
    .addChild(new Menu(MENU_LOGIN))
    .addChild(new Menu(MENU_ACCOUNT))
    .addChild(new Menu(MENU_ABOUT));

const reducer = function (state, action) {
    if (typeof state === 'undefined') state = initialState;
    switch (action.type) {
    case OPEN_MENU: {
        const menu = rootMenu.findById(action.menu);
        // Close siblings when opening a menu
        const toClose = menu.siblings().flatMap(sibling => [sibling, ...sibling.descendants()]);

        return {
            ...state,
            [action.menu]: true,
            ...Object.fromEntries(toClose.map(({id}) => [id, false]))
        };
    }
    case CLOSE_MENU: {
        const menu = rootMenu.findById(action.menu);
        // Close this menu and any submenus
        const toClose = [menu, ...menu.descendants()];

        return {
            ...state,
            ...Object.fromEntries(toClose.map(({id}) => [id, false]))
        };
    }
    default:
        return state;
    }
};
const openMenu = menu => ({
    type: OPEN_MENU,
    menu: menu
});
const closeMenu = menu => ({
    type: CLOSE_MENU,
    menu: menu
});
const openAboutMenu = () => openMenu(MENU_ABOUT);
const closeAboutMenu = () => closeMenu(MENU_ABOUT);
const aboutMenuOpen = state => state.scratchGui.menus[MENU_ABOUT];

const openAccountMenu = () => openMenu(MENU_ACCOUNT);
const closeAccountMenu = () => closeMenu(MENU_ACCOUNT);
const accountMenuOpen = state => state.scratchGui.menus[MENU_ACCOUNT];

const openSettingsMenu = () => openMenu(MENU_SETTINGS);
const closeSettingsMenu = () => closeMenu(MENU_SETTINGS);
const settingsMenuOpen = state => state.scratchGui.menus[MENU_SETTINGS];

const openAccentMenu = () => openMenu(MENU_ACCENT);
const closeAccentMenu = () => closeMenu(MENU_ACCENT);
const accentMenuOpen = state => state.scratchGui.menus[MENU_ACCENT];

const openFileMenu = () => openMenu(MENU_FILE);
const closeFileMenu = () => closeMenu(MENU_FILE);
const fileMenuOpen = state => state.scratchGui.menus[MENU_FILE];

const openEditMenu = () => openMenu(MENU_EDIT);
const closeEditMenu = () => closeMenu(MENU_EDIT);
const editMenuOpen = state => state.scratchGui.menus[MENU_EDIT];

const openLanguageMenu = () => openMenu(MENU_LANGUAGE);
const closeLanguageMenu = () => closeMenu(MENU_LANGUAGE);
const languageMenuOpen = state => state.scratchGui.menus[MENU_LANGUAGE];

const openLoginMenu = () => openMenu(MENU_LOGIN);
const closeLoginMenu = () => closeMenu(MENU_LOGIN);
const loginMenuOpen = state => state.scratchGui.menus[MENU_LOGIN];

const openErrorsMenu = () => openMenu(MENU_ERRORS);
const closeErrorsMenu = () => closeMenu(MENU_ERRORS);
const errorsMenuOpen = state => state.scratchGui.menus[MENU_ERRORS];

export {
    reducer as default,
    initialState as menuInitialState,
    openAboutMenu,
    closeAboutMenu,
    aboutMenuOpen,
    openAccountMenu,
    closeAccountMenu,
    accountMenuOpen,
    openSettingsMenu,
    closeSettingsMenu,
    settingsMenuOpen,
    openAccentMenu,
    closeAccentMenu,
    accentMenuOpen,
    openFileMenu,
    closeFileMenu,
    fileMenuOpen,
    openEditMenu,
    closeEditMenu,
    editMenuOpen,
    openLanguageMenu,
    closeLanguageMenu,
    languageMenuOpen,
    openLoginMenu,
    closeLoginMenu,
    loginMenuOpen,
    openErrorsMenu,
    closeErrorsMenu,
    errorsMenuOpen
};
