#!/usr/bin/node
'use strict'

global.browserify = require('browserify')
global.glob = require('glob')

global.nesh = require('nesh')
global.notifier = require('node-notifier')
global.MemoryStream = require('memorystream')
global.Ractive = require('ractive')

require('./lib/vendor')

global.DSRethinkDBAdapter = require('js-data-rethinkdb').RethinkDBAdapter

const Peer = require('./peer')
const Lib11 = require('lib11')
const settings = require('./settings')


// Initialize application.
settings.headless.projectDir = __dirname
// Start a nodejs High5 instance.
new Lib11(Peer, settings)
.then(() => {

}, reason => console.log(reason))
