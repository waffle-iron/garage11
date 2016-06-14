'use strict'

global.browserify = require('browserify')
global.glob = require('glob')
global.notifier = require('node-notifier')
global.MemoryStream = require('memorystream')
global.Ractive = require('ractive')
global.JSData = require('js-data')
global.DSMongoDBAdapter = require('js-data-mongodb').MongoDBAdapter

require('./lib/vendor')
var Garage11 = require('./garage11')
let High5 = require('high5')
let settings = require('./settings')


// Initialize application.
settings.headless.projectDir = __dirname
// Start a nodejs High5 instance.
new High5(Garage11, settings)
.then(() => {}, reason => console.log(reason))
