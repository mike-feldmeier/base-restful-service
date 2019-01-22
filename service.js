'use strict'

// Require system libraries...
const fs = require('fs')
const path = require('path')

// Require user libraries...
const bodyparser = require('body-parser')
const bunyan = require('bunyan')
const dotenv = require('dotenv')
const envwrapper = require('env-wrapper')
const express = require('express')
const mongoose = require('mongoose')

// Know thyself...
const self = require('./package.json')

// Create local instances...
const app = express()
const logger = bunyan.createLogger({ name: self.name })

// Bring in environment variables with defaults...
dotenv.load()
const databaseUrl = envwrapper.require('DATABASE_URL')
const port = envwrapper.require('PORT', 4000)
const routesPath = envwrapper.require('ROUTES_PATH', path.join(__dirname, 'routes'))

// Connect to database...
mongoose.connect(databaseUrl, { useNewUrlParser: true })
mongoose.connection.on('connected', () => logger.info(`Connected successfully to database`))
mongoose.connection.on('disconnected', () => logger.info(`Disconnected from database`))
mongoose.connection.on('error', err => logger.error(err, 'Could not connect to the database'))

// Register process shutdown hook...
process.on('SIGINT', () => {
  logger.info('Process shutdown detected.  Attempting to close database connection...')
  mongoose.connection.close()
  process.exitCode = 0
})

// Helper method to inject the logger into requests...
const injectLogger = (req, res, next) => {
  req.logger = logger
  next()
}

// Configure HTTP Listener...
app.use(bodyparser.json())
app.use(injectLogger)

// Bring in route handlers...
fs.readdirSync(routesPath)
  .filter(fname => path.extname(fname) === '.js')
  .forEach(fname => {
    const mname = path.basename(fname, '.js')
    logger.info(`Importing routes file "${path.join(routesPath, fname)}" [${mname}]...`)
    require(path.join(routesPath, mname))(app)
  })

// Start HTTP Listener...
app.listen(port, err => {
  if(err) {
    logger.error(err, `Could not start the HTTP listener on port ${port}`)
  }
  else {
    logger.info(`Successfully started the HTTP listener on port ${port}`)
  }
})