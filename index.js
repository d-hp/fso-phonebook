/* eslint-disable prefer-destructuring */
/* eslint-disable no-undef */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable consistent-return */
/* eslint-disable no-console */
/* eslint-disable no-else-return */
/* eslint-disable comma-dangle */
require('dotenv').config()
const express = require('express')
const morgan = require('morgan')

const app = express()
const cors = require('cors')
const Person = require('./models/person')

// App will take into use json-parser middleware
app.use(express.json())

// App will take into use cors middleware
app.use(cors())

// App will take into use express-provided static middleware using build directory
app.use(express.static('build'))

// Create new token that displays the request.body of HTTP post requests
morgan.token('req-content', (req) => JSON.stringify(req.body))

// App will take into use morgan middleware to log all requests made to web-server in console
app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms :req-content'
  )
)

// HTTP GET request to '/api/persons' -> send response of persons data in json format
app.get('/api/persons', (req, res) => {
  Person.find({})
    .then((people) => {
      res.json(people)
    })
    .catch((error) => next(error))
})

// HTTP GET request to '/info' -> send response containing RESOURCE_SIZE & REQUEST_DATE
app.get('/info', (req, res, next) => {
  Person.find({})
    .then((people) => {
      const RESOURCE_SIZE = people.length
      const REQUEST_DATE = new Date()
      res.send(
        `<p>Phonebook has info for ${RESOURCE_SIZE} people</p><p>${REQUEST_DATE}</p>`
      )
    })
    .catch((error) => next(error))
})

// HTTP GET request to '/api/persons/:id' -> send response containing person, if they exist
app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then((person) => {
      res.json(person)
    })
    .catch((err) => next(err))
})

// HTTP DELETE request to 'api/persons/:id' -> send response status code 204
app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(() => {
      res.send('Successfully deleted entry from database')
    })
    .catch((error) => next(error))
})

// HTTP POST request to 'api/persons' -> creates a new person & responds with the created person
app.post('/api/persons', (req, res, next) => {
  const body = req.body

  if (!body.name || !body.number) {
    return res.status(400).json({
      error: 'Name or number is missing',
    })
  }

  Person.find({ name: body.name })
    .then((found) => {
      if (found.length > 3) {
        if (found[0].name === body.name) {
          return res.status(400).send({
            error: 'Entry must be unique',
          })
        }
      }
    })
    .catch((error) => next(error))

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person
    .save()
    .then((p) => {
      res.json(p)
    })
    .catch((err) => next(err))
})

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body
  const id = req.params.id

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.find({ name: body.name }, (err, found) => {
    if (found[0].number !== body.number) {
      Person.findByIdAndUpdate(id, person, {
        new: true,
        runValidators: true,
        context: 'query',
      })
        .then((updatedPerson) => {
          res.json(updatedPerson)
        })
        .catch((error) => next(error))
    } else {
      res.status(400).send(err)
    }
  })
})

const unknownEndpoint = (req, res) =>
  res.status(404).send({ error: 'unknown endpoint' })

app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return res.status(400).send({
      error: 'malformatted id',
    })
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: error.message,
    })
  }

  next(error)
}
app.use(errorHandler)

// Listen on PORT 3001 for HTTP requests to this web-server
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server has started on port ${PORT}`)
})
