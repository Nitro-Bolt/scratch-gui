import {test, beforeEach, mock} from 'node:test';
import assert from 'node:assert/strict';
import SettingStore from '../src/addons/settings-store.js';
import upstreamMeta from '../src/addons/generated/upstream-meta.json' with {type: 'json'};

class LocalStorageShim {
    constructor () {
        this.storage = Object.create(null);
    }
    getItem (key) {
        return this.storage[key];
    }
    setItem (key, value) {
        this.storage[key] = value.toString();
    }
}

beforeEach(() => {
    globalThis.localStorage = new LocalStorageShim();
});

const lightTheme = {
    isDark: () => false
};

const darkTheme = {
    isDark: () => true
};

test('enabled, event', () => {
    const store = new SettingStore();
    const fn = mock.fn();
    store.addEventListener('setting-changed', fn);
    assert.equal(store.getAddonEnabled('editor-devtools'), true);
    assert.equal('enabled' in store.store['editor-devtools'], false);
    store.setAddonEnabled('editor-devtools', false);
    assert.equal(store.getAddonEnabled('editor-devtools'), false);
    assert.equal('enabled' in store.store['editor-devtools'], true);
    store.setAddonEnabled('editor-devtools', true);
    store.setAddonEnabled('cat-blocks', true);
    assert.equal('enabled' in store.store['cat-blocks'], true);
    store.setAddonEnabled('cat-blocks', null);
    assert.equal('enabled' in store.store['cat-blocks'], false);
    assert.equal(fn.mock.callCount(), 4);
    assert.equal(fn.mock.calls[0].arguments[0].detail.addonId, 'editor-devtools');
    assert.equal(fn.mock.calls[0].arguments[0].detail.settingId, 'enabled');
    assert.equal(fn.mock.calls[0].arguments[0].detail.value, false);
    assert.equal(fn.mock.calls[1].arguments[0].detail.addonId, 'editor-devtools');
    assert.equal(fn.mock.calls[1].arguments[0].detail.settingId, 'enabled');
    assert.equal(fn.mock.calls[1].arguments[0].detail.value, true);
    assert.equal(fn.mock.calls[2].arguments[0].detail.addonId, 'cat-blocks');
    assert.equal(fn.mock.calls[2].arguments[0].detail.settingId, 'enabled');
    assert.equal(fn.mock.calls[2].arguments[0].detail.value, true);
    assert.equal(fn.mock.calls[3].arguments[0].detail.addonId, 'cat-blocks');
    assert.equal(fn.mock.calls[3].arguments[0].detail.settingId, 'enabled');
    assert.equal(fn.mock.calls[3].arguments[0].detail.value, false);
});

test('settings, event, default values', () => {
    const store = new SettingStore();
    const fn = mock.fn();
    assert.equal(store.getAddonSetting('onion-skinning', 'default'), false);
    assert.equal('default' in store.store['onion-skinning'], false);
    store.addEventListener('setting-changed', fn);
    store.setAddonSetting('onion-skinning', 'default', true);
    assert.equal(store.getAddonSetting('onion-skinning', 'default'), true);
    assert.equal('default' in store.store['onion-skinning'], true);
    store.setAddonSetting('onion-skinning', 'default', null);
    assert.equal('default' in store.store['onion-skinning'], false);
    assert.equal(store.getAddonSetting('onion-skinning', 'default'), false);
    assert.equal(fn.mock.callCount(), 2);
    assert.equal(fn.mock.calls[0].arguments[0].detail.addonId, 'onion-skinning');
    assert.equal(fn.mock.calls[0].arguments[0].detail.settingId, 'default');
    assert.equal(fn.mock.calls[0].arguments[0].detail.value, true);
    assert.equal(fn.mock.calls[1].arguments[0].detail.addonId, 'onion-skinning');
    assert.equal(fn.mock.calls[1].arguments[0].detail.settingId, 'default');
    assert.equal(fn.mock.calls[1].arguments[0].detail.value, false);
});

test('no actual change emits no event', () => {
    const store = new SettingStore();
    const fn = mock.fn();
    store.addEventListener('setting-changed', fn);
    for (let i = 0; i < 5; i++) store.setAddonEnabled('cat-blocks', true);
    assert.equal(fn.mock.callCount(), 1);
    for (let i = 0; i < 5; i++) store.setAddonEnabled('cat-blocks', false);
    assert.equal(fn.mock.callCount(), 2);
    for (let i = 0; i < 5; i++) store.setAddonSetting('onion-skinning', 'default', true);
    assert.equal(fn.mock.callCount(), 3);
    for (let i = 0; i < 5; i++) store.setAddonSetting('onion-skinning', 'default', false);
    assert.equal(fn.mock.callCount(), 4);
});

test('changing enabled throws on unknown addons', () => {
    const store = new SettingStore();
    const fn = mock.fn();
    store.addEventListener('setting-changed', fn);
    assert.throws(() => store.setAddonEnabled('egriohergoijergijregojiergdfoijre', true));
    assert.equal(fn.mock.callCount(), 0);
});

test('changing settings throws on unknown settings', () => {
    const store = new SettingStore();
    const fn = mock.fn();
    store.addEventListener('setting-changed', fn);
    assert.throws(() => store.setAddonSetting('onion-skinning', 'sdlkjfslkdjfljksd', true));
    assert.throws(() => store.setAddonSetting('ergfoijgi', 'sdflkjsfdlkj', true));
    assert.equal(fn.mock.callCount(), 0);
});

test('changing enabled throws on invalid values', () => {
    const store = new SettingStore();
    const fn = mock.fn();
    store.addEventListener('setting-changed', fn);
    assert.throws(() => store.setAddonEnabled('cat-blocks', 'sdfjlksdflk'));
    assert.throws(() => store.setAddonEnabled('cat-blocks', 0));
    assert.throws(() => store.setAddonEnabled('cat-blocks', []));
    assert.throws(() => store.setAddonEnabled('cat-blocks', {}));
    assert.equal(fn.mock.callCount(), 0);
});

test('changing settings checks value validity and throws', () => {
    const store = new SettingStore();
    const fn = mock.fn();
    store.addEventListener('setting-changed', fn);
    // boolean
    assert.throws(() => store.setAddonSetting('onion-skinning', 'default', '#abcdef'));
    assert.throws(() => store.setAddonSetting('onion-skinning', 'default', []));
    assert.throws(() => store.setAddonSetting('onion-skinning', 'default', {}));
    assert.throws(() => store.setAddonSetting('onion-skinning', 'default', ''));
    assert.throws(() => store.setAddonSetting('onion-skinning', 'default', 1));
    // integer
    assert.throws(() => store.setAddonSetting('onion-skinning', 'next', '#abcdef'));
    assert.throws(() => store.setAddonSetting('onion-skinning', 'next', []));
    assert.throws(() => store.setAddonSetting('onion-skinning', 'next', {}));
    assert.throws(() => store.setAddonSetting('onion-skinning', 'next', ''));
    assert.throws(() => store.setAddonSetting('onion-skinning', 'next', '3'));
    assert.throws(() => store.setAddonSetting('onion-skinning', 'next', false));
    // select
    assert.throws(() => store.setAddonSetting('onion-skinning', 'mode', '#abcdef'));
    assert.throws(() => store.setAddonSetting('onion-skinning', 'mode', []));
    assert.throws(() => store.setAddonSetting('onion-skinning', 'mode', {}));
    assert.throws(() => store.setAddonSetting('onion-skinning', 'mode', ''));
    assert.throws(() => store.setAddonSetting('onion-skinning', 'mode', false));
    assert.throws(() => store.setAddonSetting('onion-skinning', 'mode', 1));
    assert.doesNotThrow(() => store.setAddonSetting('onion-skinning', 'mode', 'tint'));
    assert.doesNotThrow(() => store.setAddonSetting('onion-skinning', 'mode', 'merge'));
    // color
    assert.doesNotThrow(() => store.setAddonSetting('onion-skinning', 'beforeTint', '#abcdef'));
    assert.doesNotThrow(() => store.setAddonSetting('onion-skinning', 'beforeTint', '#abcDE1'));
    assert.throws(() => store.setAddonSetting('onion-skinning', 'beforeTint', []));
    assert.throws(() => store.setAddonSetting('onion-skinning', 'beforeTint', {}));
    assert.throws(() => store.setAddonSetting('onion-skinning', 'beforeTint', ''));
    assert.throws(() => store.setAddonSetting('onion-skinning', 'beforeTint', false));
    assert.throws(() => store.setAddonSetting('onion-skinning', 'beforeTint', 1));
    assert.equal(fn.mock.callCount(), 4);
});

test('colors with alpha channel', () => {
    const store = new SettingStore();
    store.setAddonSetting('onion-skinning', 'beforeTint', '#123456');
    assert.equal(store.getAddonSetting('onion-skinning', 'beforeTint'), '#123456');
    store.setAddonSetting('onion-skinning', 'beforeTint', '#234567ff');
    assert.equal(store.getAddonSetting('onion-skinning', 'beforeTint'), '#234567');
    store.setAddonSetting('onion-skinning', 'beforeTint', '#abc67800');
    assert.equal(store.getAddonSetting('onion-skinning', 'beforeTint'), '#abc678');
    store.import({
        addons: {
            'onion-skinning': {
                settings: {
                    beforeTint: '#56789aff'
                }
            }
        }
    });
    assert.equal(store.getAddonSetting('onion-skinning', 'beforeTint'), '#56789a');
});

test('reset does not change enabled', () => {
    const store = new SettingStore();
    store.setAddonEnabled('cat-blocks', true);
    store.resetAddon('cat-blocks');
    assert.equal(store.getAddonEnabled('cat-blocks'), true);
});

test('reset settings, event', () => {
    const store = new SettingStore();
    store.setAddonSetting('onion-skinning', 'default', true);
    store.setAddonSetting('onion-skinning', 'next', 3);
    const fn = mock.fn();
    store.addEventListener('setting-changed', fn);
    store.resetAddon('onion-skinning');
    assert.equal(store.getAddonSetting('onion-skinning', 'default'), false);
    assert.equal(store.getAddonSetting('onion-skinning', 'next'), 0);
    assert.equal(fn.mock.callCount(), 2);
    assert.equal(fn.mock.calls[0].arguments[0].detail.addonId, 'onion-skinning');
    assert.equal(fn.mock.calls[0].arguments[0].detail.settingId, 'default');
    assert.equal(fn.mock.calls[0].arguments[0].detail.value, false);
    assert.equal(fn.mock.calls[1].arguments[0].detail.addonId, 'onion-skinning');
    assert.equal(fn.mock.calls[1].arguments[0].detail.settingId, 'next');
    assert.equal(fn.mock.calls[1].arguments[0].detail.value, 0);
});

test('reset all addons', () => {
    const store = new SettingStore();
    store.setAddonEnabled('cat-blocks', true);
    store.setAddonSetting('onion-skinning', 'default', true);
    const fn = mock.fn();
    store.addEventListener('setting-changed', fn);
    store.resetAllAddons();
    assert.equal(fn.mock.callCount(), 2);
    assert.equal(fn.mock.calls[0].arguments[0].detail.addonId, 'cat-blocks');
    assert.equal(fn.mock.calls[0].arguments[0].detail.settingId, 'enabled');
    assert.equal(fn.mock.calls[0].arguments[0].detail.value, false);
    assert.equal(fn.mock.calls[1].arguments[0].detail.addonId, 'onion-skinning');
    assert.equal(fn.mock.calls[1].arguments[0].detail.settingId, 'default');
    assert.equal(fn.mock.calls[1].arguments[0].detail.value, false);
});

test('apply preset', () => {
    const store = new SettingStore();
    const fn = mock.fn();
    store.addEventListener('setting-changed', fn);
    store.setAddonSetting('editor-theme3', 'motion-color', '#abcdef');
    store.applyAddonPreset('editor-theme3', 'original');
    assert.ok(fn.mock.callCount() > 5);
    assert.equal(store.getAddonSetting('editor-theme3', 'motion-color'), '#4a6cd4');
    // TODO: test that settings not specified in the preset don't change
});

test('unknown preset throws', () => {
    const store = new SettingStore();
    const fn = mock.fn();
    store.addEventListener('setting-changed', fn);
    assert.throws(() => store.applyAddonPreset('alksdfjlksdf', 'jksdflkjsdf'));
    assert.throws(() => store.applyAddonPreset('editor-theme3', 'jksdflkjsdf'));
    assert.equal(fn.mock.callCount(), 0);
});

test('export core', () => {
    const store = new SettingStore();
    const exported = store.export({theme: lightTheme});
    assert.match(exported.core.version, /tw/);
    assert.equal(exported.core.lightTheme, true);
    const dark = store.export({theme: darkTheme});
    assert.equal(dark.core.lightTheme, false);
});

test('export settings', () => {
    const store = new SettingStore();
    let exported = store.export({theme: lightTheme});
    assert.equal(exported.addons['remove-sprite-confirm'].enabled, false);
    assert.deepEqual(exported.addons['remove-sprite-confirm'].settings, {});
    assert.equal(exported.addons['onion-skinning'].enabled, true);
    assert.deepEqual(exported.addons['onion-skinning'].settings.default, false);
    store.setAddonEnabled('remove-sprite-confirm', true);
    store.setAddonSetting('onion-skinning', 'default', true);
    exported = store.export({theme: lightTheme});
    assert.equal(exported.addons['remove-sprite-confirm'].enabled, true);
    assert.deepEqual(exported.addons['remove-sprite-confirm'].settings, {});
    assert.equal(exported.addons['onion-skinning'].enabled, true);
    assert.deepEqual(exported.addons['onion-skinning'].settings.default, true);
});

test('export theme', () => {
    const store = new SettingStore();
    const exported = store.export({theme: lightTheme});
    assert.equal(exported.core.lightTheme, true);
    const exported2 = store.export({theme: darkTheme});
    assert.equal(exported2.core.lightTheme, false);
});

test('import, event', () => {
    const store = new SettingStore();
    store.setAddonEnabled('onion-skinning', false);
    store.setAddonSetting('onion-skinning', 'next', 5);
    const newStore = new SettingStore();
    newStore.setAddonSetting('onion-skinning', 'next', 10);
    const fn = mock.fn();
    newStore.addEventListener('setting-changed', fn);
    newStore.import(store.export({theme: lightTheme}));
    assert.equal(newStore.getAddonEnabled('onion-skinning'), false);
    assert.equal(newStore.getAddonSetting('onion-skinning', 'next'), 5);
    assert.equal(fn.mock.callCount(), 2);
    assert.equal(fn.mock.calls[0].arguments[0].detail.addonId, 'onion-skinning');
    assert.equal(fn.mock.calls[0].arguments[0].detail.settingId, 'enabled');
    assert.equal(fn.mock.calls[0].arguments[0].detail.value, false);
    assert.equal(fn.mock.calls[1].arguments[0].detail.addonId, 'onion-skinning');
    assert.equal(fn.mock.calls[1].arguments[0].detail.settingId, 'next');
    assert.equal(fn.mock.calls[1].arguments[0].detail.value, 5);
});

test('export is identical after import', () => {
    const store = new SettingStore();
    const fn = mock.fn();
    const exported = store.export({theme: lightTheme});
    store.import(exported);
    assert.equal(fn.mock.callCount(), 0);
    assert.deepEqual(store.export({theme: lightTheme}), exported);
});

test('import format', () => {
    const store = new SettingStore();
    store.setAddonEnabled('cat-blocks', true);
    store.import({
        core: {
            version: 'lksd',
            lightTheme: false
        },
        addons: {
            'onion-skinning': {
                enabled: false,
                settings: {
                    next: 7
                }
            }
        }
    });
    assert.equal(store.getAddonEnabled('onion-skinning'), false);
    assert.equal(store.getAddonSetting('onion-skinning', 'next'), 7);
    assert.equal(store.getAddonEnabled('cat-blocks'), true);
});

test('invalid imports', () => {
    const store = new SettingStore();
    assert.doesNotThrow(() => store.import({
        addons: {}
    }));
    assert.doesNotThrow(() => store.import({
        addons: {
            'onion-skinning': {
                enabled: false,
                settings: {
                    dsjfokosdfj: 5
                }
            }
        }
    }));
    assert.doesNotThrow(() => store.import({
        addons: {
            grfdjiklk: {
                enabled: true,
                settings: {}
            }
        }
    }));
    assert.doesNotThrow(() => store.import({
        addons: {
            'onion-skinning': {
                enabled: '4',
                settings: {
                    default: '3'
                }
            }
        }
    }));
    assert.equal(store.getAddonEnabled('onion-skinning'), false);
    assert.equal(store.getAddonSetting('onion-skinning', 'default'), false);
});

test('local storage', () => {
    const store = new SettingStore();
    store.setAddonEnabled('cat-blocks', true);
    store.setAddonSetting('onion-skinning', 'default', true);
    const newStore = new SettingStore();
    newStore.readLocalStorage();
    assert.deepEqual(newStore.store, store.store);
});

test('local storage is resistent to errors', () => {
    globalThis.localStorage = new LocalStorageShim();
    const store = new SettingStore();
    localStorage.getItem = () => {
        throw new Error(':(');
    };
    store.readLocalStorage();
    localStorage.getItem = () => 'eoiru4jtg)(R(';
    store.readLocalStorage();
    localStorage.setItem = () => {
        throw new Error(':(');
    };
    store.setAddonEnabled('cat-blocks', true);
    // eslint-disable-next-line no-undefined
    globalThis.localStorage = undefined;
    store.readLocalStorage();
    store.setAddonEnabled('cat-blocks', false);
});

test('setStore diffing', () => {
    const settingsStore = new SettingStore();
    const pageStore = new SettingStore();
    settingsStore.setAddonEnabled('editor-devtools', false);
    pageStore.setAddonEnabled('editor-devtools', false);
    const fn = mock.fn();
    pageStore.addEventListener('addon-changed', fn);
    pageStore.setStore(settingsStore.store);
    assert.equal(fn.mock.callCount(), 0);
    settingsStore.setAddonEnabled('editor-devtools', true);
    settingsStore.setAddonSetting('onion-skinning', 'next', 10);
    pageStore.setStore(settingsStore.store);
    assert.equal(fn.mock.callCount(), 2);
    assert.equal(fn.mock.calls[0].arguments[0].detail.addonId, 'editor-devtools');
    assert.equal(fn.mock.calls[1].arguments[0].detail.addonId, 'onion-skinning');
});

test('setStore dynamic enable/disable', () => {
    const settingsStore = new SettingStore();
    const pageStore = new SettingStore();
    settingsStore.setAddonEnabled('block-palette-icons', false);
    pageStore.setStore(settingsStore.store);
    const fn = mock.fn();
    pageStore.addEventListener('addon-changed', fn);
    settingsStore.setAddonEnabled('block-palette-icons', true);
    pageStore.setStore(settingsStore.store);
    assert.equal(fn.mock.calls[0].arguments[0].detail.addonId, 'block-palette-icons');
    assert.equal(fn.mock.calls[0].arguments[0].detail.dynamicEnable, true);
    assert.equal(fn.mock.calls[0].arguments[0].detail.dynamicDisable, false);
    settingsStore.setAddonEnabled('block-palette-icons', false);
    pageStore.setStore(settingsStore.store);
    assert.equal(fn.mock.calls[1].arguments[0].detail.addonId, 'block-palette-icons');
    assert.equal(fn.mock.calls[1].arguments[0].detail.dynamicEnable, false);
    assert.equal(fn.mock.calls[1].arguments[0].detail.dynamicDisable, true);
});

test('setStore weird values', () => {
    const settingsStore = new SettingStore();
    assert.equal(settingsStore.getAddonEnabled('pause'), true);
    settingsStore.setAddonEnabled('pause', false);
    settingsStore.setAddonEnabled('clones', true);
    settingsStore.setStore({
        invalid0: {},
        invalid1: null,
        pause: null
    });
    assert.equal(settingsStore.getAddonEnabled('pause'), false);
});

test('resetting an addon through setStore', () => {
    const store = new SettingStore();
    assert.equal(store.getAddonSetting('custom-block-shape', 'paddingSize'), 100);
    store.setAddonSetting('custom-block-shape', 'paddingSize', 50);
    assert.equal(store.getAddonSetting('custom-block-shape', 'paddingSize'), 50);
    const store2 = new SettingStore();
    store.setStore(store2.store);
    assert.equal(store.getAddonSetting('custom-block-shape', 'paddingSize'), 100);
});

test('setStoreWithVersionCheck', () => {
    const store = new SettingStore();
    store.setStore = mock.fn();
    store.setStoreWithVersionCheck({
        store: '1234',
        version: upstreamMeta.commit
    });
    assert.equal(store.setStore.mock.callCount(), 1);
    assert.deepEqual(store.setStore.mock.calls[0].arguments, ['1234']);
    store.setStore = mock.fn();
    store.setStoreWithVersionCheck({
        store: '1234',
        version: 'something invalid'
    });
    assert.equal(store.setStore.mock.callCount(), 0);
});

test('parseUrlParameter', () => {
    const store = new SettingStore();
    assert.equal(store.getAddonEnabled('pause'), true);
    assert.equal(store.getAddonEnabled('mute-project'), true);
    assert.equal(store.getAddonEnabled('remove-curved-stage-border'), false);
    assert.equal(store.remote, false);
    store.parseUrlParameter('pause,remove-curved-stage-border,,invalid addon??43t987(*&$');
    assert.equal(store.getAddonEnabled('pause'), true);
    assert.equal(store.getAddonEnabled('mute-project'), false);
    assert.equal(store.getAddonEnabled('remove-curved-stage-border'), true);
    assert.equal(store.remote, true);
});

test('Settings migration 1 -> 2', () => {
    const store = new SettingStore();

    // eslint-disable-next-line max-len
    globalThis.localStorage.getItem = () => `{"_":1,"tw-project-info":{"enabled":false},"tw-interface-customization":{"enabled":false,"removeFeedback":true,"removeBackpack":true}}`;
    store.readLocalStorage();
    assert.equal(store.getAddonEnabled('block-count'), false);
    assert.equal(store.getAddonEnabled('tw-remove-backpack'), false);
    assert.equal(store.getAddonEnabled('tw-remove-feedback'), false);

    // eslint-disable-next-line max-len
    globalThis.localStorage.getItem = () => `{"_":1,"tw-project-info":{"enabled":true},"tw-interface-customization":{"enabled":true,"removeFeedback":true,"removeBackpack":true}}`;
    store.readLocalStorage();
    assert.equal(store.getAddonEnabled('block-count'), true);
    assert.equal(store.getAddonEnabled('tw-remove-backpack'), true);
    assert.equal(store.getAddonEnabled('tw-remove-feedback'), true);
});

test('Settings migration 2 -> 3', () => {
    const store = new SettingStore();

    globalThis.localStorage.getItem = () => JSON.stringify({
        '_': 2,
        'hide-flyout': {
            enabled: true
        }
    });
    store.readLocalStorage();
    assert.equal(store.getAddonSetting('hide-flyout', 'toggle'), 'hover');
});

test('Settings migration 3 -> 4', () => {
    const store = new SettingStore();

    globalThis.localStorage.getItem = () => JSON.stringify({
        _: 3
    });
    store.readLocalStorage();
    assert.equal(store.getAddonEnabled('editor-devtools'), true);
    assert.equal(store.getAddonEnabled('find-bar'), true);
    assert.equal(store.getAddonEnabled('middle-click-popup'), true);

    globalThis.localStorage.getItem = () => JSON.stringify({
        '_': 3,
        'editor-devtools': {
            enabled: false
        }
    });
    store.readLocalStorage();
    assert.equal(store.getAddonEnabled('editor-devtools'), false);
    assert.equal(store.getAddonEnabled('find-bar'), false);
    assert.equal(store.getAddonEnabled('middle-click-popup'), false);
});

test('if', () => {
    const store = new SettingStore();
    store.setAddonEnabled('editor-devtools', true);
    store.setAddonEnabled('onion-skinning', false);
    store.setAddonSetting('editor-theme3', 'motion-color', '#000000');
    store.setAddonSetting('editor-theme3', 'looks-color', '#FFFFFF');

    // eslint-disable-next-line no-undefined
    assert.equal(store.evaluateCondition('editor-theme3', undefined), true);
    assert.equal(store.evaluateCondition('editor-theme3', null), true);
    assert.equal(store.evaluateCondition('editor-theme3', {}), true);

    assert.equal(store.evaluateCondition('editor-theme3', {
        addonEnabled: ['onion-skinning']
    }), false);
    assert.equal(store.evaluateCondition('editor-theme3', {
        addonEnabled: 'onion-skinning'
    }), false);
    assert.equal(store.evaluateCondition('editor-theme3', {
        addonEnabled: ['editor-devtools']
    }), true);
    assert.equal(store.evaluateCondition('editor-theme3', {
        addonEnabled: 'editor-devtools'
    }), true);
    assert.equal(store.evaluateCondition('editor-theme3', {
        addonEnabled: ['editor-devtools', 'onion-skinning']
    }), true);

    assert.equal(store.evaluateCondition('editor-theme3', {
        settings: {}
    }), true);
    assert.equal(store.evaluateCondition('editor-theme3', {
        settings: {
            'motion-color': '#000000'
        }
    }), true);
    assert.equal(store.evaluateCondition('editor-theme3', {
        settings: {
            'looks-color': '#FFFFFF'
        }
    }), true);
    assert.equal(store.evaluateCondition('editor-theme3', {
        settings: {
            'looks-color': '#FFFFFE'
        }
    }), false);
    assert.equal(store.evaluateCondition('editor-theme3', {
        settings: {
            'motion-color': '#000000',
            'looks-color': '#FFFFFF'
        }
    }), true);
    assert.equal(store.evaluateCondition('editor-theme3', {
        settings: {
            'motion-color': '#000001',
            'looks-color': '#FFFFFF'
        }
    }), false);

    assert.equal(store.evaluateCondition('editor-theme3', {
        settings: {
            'looks-color': ['#FFFFFF']
        }
    }), true);
    assert.equal(store.evaluateCondition('editor-theme3', {
        settings: {
            'looks-color': ['#FFFFFE', '#FFFFFF']
        }
    }), true);
    assert.equal(store.evaluateCondition('editor-theme3', {
        settings: {
            'looks-color': ['#FFFFFF', '#FFFFFE']
        }
    }), true);
    assert.equal(store.evaluateCondition('editor-theme3', {
        settings: {
            'looks-color': ['#FFFFFE']
        }
    }), false);
    assert.equal(store.evaluateCondition('editor-theme3', {
        settings: {
            'looks-color': ['#FFFFFE', '#FFFFFD']
        }
    }), false);
    assert.equal(store.evaluateCondition('editor-theme3', {
        settings: {
            'looks-color': []
        }
    }), false);

    assert.equal(store.evaluateCondition('editor-theme3', {
        addonEnabled: ['editor-devtools'],
        settings: {
            'motion-color': '#000000'
        }
    }), true);
    assert.equal(store.evaluateCondition('editor-theme3', {
        addonEnabled: ['onion-skinning'],
        settings: {
            'motion-color': '#000000'
        }
    }), false);
    assert.equal(store.evaluateCondition('editor-theme3', {
        addonEnabled: ['editor-devtools'],
        settings: {
            'motion-color': '#000001'
        }
    }), false);
    assert.equal(store.evaluateCondition('editor-theme3', {
        addonEnabled: ['onion-skinning'],
        settings: {
            'motion-color': '#000001'
        }
    }), false);
});

test('Settings migration 4 -> 5', () => {
    const store = new SettingStore();

    // implied default settings
    globalThis.localStorage.getItem = () => JSON.stringify({
        _: 4
    });
    store.readLocalStorage();
    assert.equal(store.getAddonSetting('fullscreen', 'toolbar'), 'show');

    // also implied default settings
    globalThis.localStorage.getItem = () => JSON.stringify({
        _: 4,
        fullscreen: {}
    });
    store.readLocalStorage();
    assert.equal(store.getAddonSetting('fullscreen', 'toolbar'), 'show');

    // explicit default settings
    globalThis.localStorage.getItem = () => JSON.stringify({
        '_': 4,
        'fullscreen': {
            hideToolbar: false
        }
    });
    store.readLocalStorage();
    assert.equal(store.getAddonSetting('fullscreen', 'toolbar'), 'show');

    // explicit hide, implied default hover setting
    globalThis.localStorage.getItem = () => JSON.stringify({
        '_': 4,
        'fullscreen': {
            hideToolbar: true
        }
    });
    store.readLocalStorage();
    assert.equal(store.getAddonSetting('fullscreen', 'toolbar'), 'hover');

    // explicit hide and default hover
    globalThis.localStorage.getItem = () => JSON.stringify({
        '_': 4,
        'fullscreen': {
            hideToolbar: true,
            hoverToolbar: true
        }
    });
    store.readLocalStorage();
    assert.equal(store.getAddonSetting('fullscreen', 'toolbar'), 'hover');

    // explicit hide, no hover
    globalThis.localStorage.getItem = () => JSON.stringify({
        '_': 4,
        'fullscreen': {
            hideToolbar: true,
            hoverToolbar: false
        }
    });
    store.readLocalStorage();
    assert.equal(store.getAddonSetting('fullscreen', 'toolbar'), 'hide');
});
