'use strict';

const stringify = require('json-stable-stringify');

/**
 * The variable name that pwa expects manifest entries to be assigned.
 * @type {String}
 * @private
 */
const PRECACHE_MANIFEST_VAR = '__precacheManifest';

module.exports = entries => {
  const entriesJson = stringify(entries, { space: 4 });
  return `self.${PRECACHE_MANIFEST_VAR} = ${entriesJson};`;
};