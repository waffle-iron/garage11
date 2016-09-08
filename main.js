#!/usr/bin/node
'use strict'

// Available globals to prevent browserify pollution.
global.browserify = require('browserify')
global.DSRethinkDBAdapter = require('js-data-rethinkdb').RethinkDBAdapter
global.glob = require('glob')
global.MemoryStream = require('memorystream')
global.nesh = require('nesh')
global.notifier = require('node-notifier')
global.Ractive = require('ractive')

require('./lib/vendor')

const Peer = require('./peer')
const Lib11 = require('lib11')
const settings = require('./settings')


// Initialize application.
settings.headless.projectDir = __dirname
// Start a Lib11 instance.
new Lib11(Peer, settings)
.then(() => {

}, reason => console.log(reason))
