'use strict'

const mongoose = require('mongoose')
const paginate = require('mongoose-paginate')

const ResourceSchema = new mongoose.Schema({
  name: { type: String, required: true }, 
  url: { type: String, required: true }, 
  description: { type: String }
})

ResourceSchema.plugin(paginate)

module.exports = mongoose.model('resources', ResourceSchema)