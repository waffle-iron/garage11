'use strict'

// Browser specific libraries for high5, splitted from the main application.
require('high5/lib/includes')
global.Ractive = require('ractive/ractive')
global.JSData = require('js-data')
global.DSLocalStorageAdapter = require('js-data-localstorage').LocalStorageAdapter
global.markdown = require('markdown').markdown
