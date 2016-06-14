'use strict'

global.browserify = require('browserify')
global.glob = require('glob')
global.notifier = require('node-notifier')
global.MemoryStream = require('memorystream')
global.Ractive = require('ractive')

require('./lib/vendor')

global.DSMongoDBAdapter = require('js-data-mongodb').MongoDBAdapter

var Garage11 = require('./garage11')
let High5 = require('high5')
let settings = require('./settings')


// Initialize application.
settings.headless.projectDir = __dirname
// Start a nodejs High5 instance.
new High5(Garage11, settings)
.then(() => {}, reason => console.log(reason))
