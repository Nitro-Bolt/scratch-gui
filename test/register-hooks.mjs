/**
 * @fileoverview
 * Tiny bridge between webpack's permissive import rules and what Node.js wants.
 */

import {registerHooks} from 'node:module';

registerHooks({
    resolve (specifier, context, nextResolve) {
        let result;
        try {
            result = nextResolve(specifier, context);
        } catch (e) {
            if (e.code !== 'ERR_MODULE_NOT_FOUND' || !/^\.\.?\//.test(specifier)) {
                throw e;
            }
            result = nextResolve(`${specifier}.js`, context);
        }
        if (result.url.endsWith('.json')) {
            result = {
                ...result,
                importAttributes: {
                    ...result.importAttributes,
                    type: 'json'
                }
            };
        }
        return result;
    }
});
