/**
 * Copyright (C) 2021 Thomas Weber
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import downloadBlob from '../lib/download-blob.js';
import Settings from '../addons/settings/settings.jsx';
import appTarget from './app-target';

import {LANGUAGE_KEY} from '../lib/detect-locale.js';
import {ACCENT_KEY} from '../lib/themes/themePersistance.js';

import entries from '../addons/generated/l10n-entries.js';
import settings_entries from '../addons/generated/l10n-settings-entries.js';

import AppStateHOC from "../lib/app-state-hoc.jsx";

import { getInitialDarkMode } from '../lib/tw-theme-hoc.jsx';

const onExportSettings = settings => {
    const blob = new Blob([JSON.stringify(settings)]);
    downloadBlob('turbowarp-addon-settings.json', blob);
};

const onRequestClose = () => {
    console.log("This does absolutely nothing.")
};

const handleItemSelect = () => {
    console.log("This does absolutely nothing.")
};

const getLanguageKey = () => {
    return localStorage.getItem(LANGUAGE_KEY);
};

const messages = {};
for (const locale of Object.keys(entries)) {
    messages[locale] = {
        ...(entries[locale] || {}),
        ...(settings_entries[locale] || {})
    };
}

const normalizeLocale = (loc) => {
    if (!loc) return 'en';
    if (messages[loc]) return loc;
    const shortLoc = loc.split('-')[0];
    return messages[shortLoc] ? shortLoc : 'en';
};

const locale = normalizeLocale(getLanguageKey());
const localeMessages = messages[locale];

const rtlLocales = ['ar', 'he', 'fa', 'ur'];
const isRtl = rtlLocales.includes(locale);

const AppStateSettings = AppStateHOC(Settings);

new AppStateSettings({});

const AddonHooks = AppStateSettings.AddonHooks;
console.log("AddonHooks: ", AddonHooks)

let getBackButtonDiv;
let reactModel;

const waitForStore = setInterval(() => {
    const store = AddonHooks.appStateStore;
    if (store) {
        clearInterval(waitForStore);

        ReactDOM.render((
            <Provider store={store}>
                <IntlProvider locale={locale} messages={localeMessages}>
                    <AppStateSettings
                        onExportSettings={onExportSettings}
                        onRequestClose={onRequestClose}
                        visible={true}
                        handleItemSelect={handleItemSelect}
                        isRtl={isRtl}
                    />
                </IntlProvider>
            </Provider>
        ), appTarget);

        getBackButtonDiv = document.querySelector('[class^="button_outlined-button"]');
        if (getBackButtonDiv) {
            getBackButtonDiv.innerHTML = ''
        }

        let previousThemeValue = null;
        let previousAccentValue = null;

        setInterval(() => {
            const themeValue = getInitialDarkMode() ? 'dark' : 'light';
            if (themeValue !== previousThemeValue) {
                document.body.setAttribute("theme", themeValue)
                previousThemeValue = themeValue;
            }
            const accentValue = localStorage.getItem(ACCENT_KEY)
            if (accentValue !== previousAccentValue) {
                document.body.setAttribute("coloraccent", accentValue)
                previousAccentValue = accentValue;
            }
        }, 50);

        /*reactModel = document.querySelector('ReactModal__Overlay ReactModal__Overlay--after-open modal_modal-overlay');
        const theme = getInitialDarkMode() ? 'dark' : 'light';
        if (reactModel) {
            reactModel.setAttribute('theme', theme);
        }*/
    }
}, 50);
