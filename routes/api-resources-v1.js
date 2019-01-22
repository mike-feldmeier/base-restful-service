'use strict'

const resources = require('../controllers/resources')

const prefix = '/api/v1/resources'
const specificationUrl = ''

// Helper method to reconstruct the complete original URL...
const url = req => `${req.protocol}://${req.get('host')}${req.originalUrl}`

// Helper method to log and create a generic server error response in JSON:API format...
const handleGenericServerError = (req, res, err, data, message) => {
  req.logger.error(err, message, data)
  res.status(500).json({
    errors: [{
      status: 500, 
      message: message, 
      detail: err
    }]
  })
  return true
}

// Helper method to transform a Mongoose Validation error to a JSON:API format...
const handleMongooseValidationError = (res, err) => {
  if(err.name === 'ValidationError') {
    res.status(400).json({
      errors: Object.values(err.errors).map(e => {
        return {
          status: 400, 
          message: e.message, 
          links: {
            about: specificationUrl
          }
        }
      })
    })
    return true
  }
  return false
}

const create = async (req, res) => {
  try {
    const result = await resources.create(req.body.data)
    res.set('Location', `${url(req)}/${result._id}`)
    res.sendStatus(201)
  }
  catch(err) {
    handleMongooseValidationError(res, err) ||
    handleGenericServerError(req, res, err, req.body.data, 'Could not create resource')
  }
}

const list = async (req, res) => {
  const options = { filter: req.query.filter, sort: req.query.sort, page: req.query.page }

  try {
    const result = await resources.list(options)
    res.json({
      links: {
        self: url(req), 
        about: specificationUrl
      },
      data: result.docs, 
      meta: {
        count: result.docs.length, 
        limit: result.limit, 
        page: result.page, 
        pages: result.pages
      }
    })
  }
  catch(err) {
    handleGenericServerError(req, res, err, options, 'Could not list resources')
  }
}

const detail = async (req, res) => {
  try {
    const result = await resources.detail(req.params.id)

    if(result) {
      res.json({
        links: {
          self: url(req)
        },
        data: result
      })
    }
    else {
      res.sendStatus(404)
    }
  }
  catch(err) {
    handleGenericServerError(req, res, err, { requestedId: req.params.id }, `Could not retrieve a specific resource [id: ${req.params.id}]`)
  }
}

const replace = async (req, res) => {
  try {
    const result = await resources.replace(req.params.id, req.body.data)
    res.set('Location', `${url(req)}/${result._id}`)
    res.sendStatus(200)
  }
  catch(err) {
    handleMongooseValidationError(res, err) ||
    handleGenericServerError(req, res, err, req.body.data, `Could not replace resource [id: ${req.params.id}]`)
  }
}

const modify = async (req, res) => {
  try {
    const result = await resources.modify(req.params.id, req.body.data)
    res.set('Location', `${url(req)}/${result._id}`)
    res.sendStatus(200)
  }
  catch(err) {
    handleMongooseValidationError(res, err) ||
    handleGenericServerError(req, res, err, req.body.data, `Could not modify resource [id: ${req.params.id}]`)
  }
}

const remove = async (req, res) => {
  try {
    const result = await resources.remove(req.params.id)
    res.sendStatus(result ? 200 : 404)
  }
  catch(err) {
    handleGenericServerError(req, res, err, { requestedId: req.params.id }, `Could not remove resource [id: ${req.params.id}]`)
  }
}

module.exports = router => {
  router.post(`${prefix}`, create)
  router.get(`${prefix}`, list)
  router.get(`${prefix}/:id`, detail)
  router.put(`${prefix}/:id`, replace)
  router.patch(`${prefix}/:id`, modify)
  router.delete(`${prefix}/:id`, remove)
}