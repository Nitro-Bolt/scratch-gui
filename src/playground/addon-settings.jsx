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
import downloadBlob from '../lib/download-blob.js';
import Settings from '../addons/settings/settings.jsx';
import appTarget from './app-target';

import {LANGUAGE_KEY} from '../lib/detect-locale.js';

import de1 from '../addons/addons-l10n/de.json';
import en from '../addons/addons-l10n/en.json';
import es1 from '../addons/addons-l10n/es.json';
import fr1 from '../addons/addons-l10n/fr.json';
import hu1 from '../addons/addons-l10n/hu.json';
import it1 from '../addons/addons-l10n/it.json';
import ja1 from '../addons/addons-l10n/ja.json';
import ko1 from '../addons/addons-l10n/ko.json';
import nl1 from '../addons/addons-l10n/nl.json';
import pl1 from '../addons/addons-l10n/pl.json';
import pt1 from '../addons/addons-l10n/pt.json';
import ro1 from '../addons/addons-l10n/ro.json';
import ru1 from '../addons/addons-l10n/ru.json';
import sl1 from '../addons/addons-l10n/sl.json';
import tr1 from '../addons/addons-l10n/tr.json';
import zhtw1 from '../addons/addons-l10n/zh-tw.json';

import de2 from '../addons/addons-l10n-settings/de.json';
import es2 from '../addons/addons-l10n-settings/es.json';
import fr2 from '../addons/addons-l10n-settings/fr.json';
import hu2 from '../addons/addons-l10n-settings/hu.json';
import it2 from '../addons/addons-l10n-settings/it.json';
import ja2 from '../addons/addons-l10n-settings/ja.json';
import ko2 from '../addons/addons-l10n-settings/ko.json';
import nl2 from '../addons/addons-l10n-settings/nl.json';
import pl2 from '../addons/addons-l10n-settings/pl.json';
import pt2 from '../addons/addons-l10n-settings/pt.json';
import ro2 from '../addons/addons-l10n-settings/ro.json';
import ru2 from '../addons/addons-l10n-settings/ru.json';
import sl2 from '../addons/addons-l10n-settings/sl.json';
import tr2 from '../addons/addons-l10n-settings/tr.json';
import zhtw2 from '../addons/addons-l10n-settings/zh-tw.json';

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

const messages = {
    'de': {
        ...de1, 
        ...de2
    },
    'en': {
        ...en
    },
    'es': {
        ...es1, 
        ...es2
    },
    'es-419': {
        ...es1, 
        ...es2
    },
    'fr': {
        ...fr1, 
        ...fr2
    },
    'hu': {
        ...hu1, 
        ...hu2
    },
    'it': {
        ...it1, 
        ...it2
    },
    'ja': {
        ...ja1, 
        ...ja2
    },
    'ko': {
        ...ko1, 
        ...ko2
    },
    'nl': {
        ...nl1, 
        ...nl2
    },
    'pl': {
        ...pl1, 
        ...pl2
    },
    'pt': {
        ...pt1, 
        ...pt2
    },
    'ro': {
        ...ro1, 
        ...ro2
    },
    'ru': {
        ...ru1, 
        ...ru2
    },
    'sl': {
        ...sl1, 
        ...sl2
    },
    'tr': {
        ...tr1, 
        ...tr2
    },
    'zh-tw': {
        ...zhtw1, 
        ...zhtw2
    },
}

ReactDOM.render((
    <IntlProvider locale={getLanguageKey} messages={messages[getLanguageKey]}>
        <Settings
            onExportSettings={onExportSettings}
            onRequestClose={onRequestClose}
            visible={true}
            handleItemSelect={handleItemSelect}
        />
    </IntlProvider>
), appTarget);
