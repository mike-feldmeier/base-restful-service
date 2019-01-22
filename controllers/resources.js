'use strict'

const Resource = require('../models/resource')

const create = async document => {
  return new Resource(document).save()
}

const list = async options => {
  const filter = Object.assign({}, options.filter)
  const sort = (options.sort || '-when').replace(/,/g, ' ')
  const page = Object.assign({}, { page: 1, limit: 10 }, options.page)
  return Resource.paginate(filter, { sort: sort, page: parseInt(page.page), limit: parseInt(page.limit) })
}

const detail = async id => {
  return Resource.findById(id).exec()
}

const replace = async (id, document) => {
  delete document._id
  return Resource.findOneAndReplace(id, document).exec()
}

const modify = (id, spec) => {
  return Resource.findOneAndUpdate(id, spec, { new: true, runValidators: true }).exec()
}

const remove = id => {
  return Resource.findOneAndDelete(id).exec()
}

module.exports = { create, list, detail, replace, modify, remove }