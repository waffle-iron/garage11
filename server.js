'use strict'

GLOBAL.browserify = require('browserify')
GLOBAL.glob = require('glob')
GLOBAL.notifier = require('node-notifier')
GLOBAL.MemoryStream = require('memorystream')
GLOBAL.Ractive = require('ractive')
GLOBAL.JSData = require('js-data')
GLOBAL.DSMongoDBAdapter = require('js-data-mongodb')
GLOBAL.DSRtcAdapter = require('js-data-rtc')

require('./libs')
var Garage11 = require('./garage11')
let High5 = require('high5')
let settings = require('./settings')


// Initialize application.
settings.headless.projectDir = __dirname
// Start a nodejs High5 instance.
new High5(Garage11, settings)
.then(() => {}, reason => console.log(reason))
