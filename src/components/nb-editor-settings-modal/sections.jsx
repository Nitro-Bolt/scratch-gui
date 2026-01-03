import React from 'react';
import {defineMessages} from 'react-intl';

export const messages = defineMessages({
    example1: {
        id: 'nb.editorSettings.example1',
        defaultMessage: 'Example 1'
    },
    example2: {
        id: 'nb.editorSettings.example2',
        defaultMessage: 'Example 2 :D'
    }
});

export const sections = [
    {
        title: messages.example1,
        content: <div>
            <h1>Example</h1>
            <p>example</p>
        </div>
    },
    {
        title: messages.example2,
        content: <div>
            <h1>Example2</h1>
            <p>example</p>
        </div>
    },
];
