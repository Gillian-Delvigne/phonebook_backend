const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
require('dotenv').config()

const Person = require('./models/person')
const PORT = process.env.PORT

const app = express()

app.use(cors())
app.use(express.static('public'))
app.use(express.json())

app.use(
  morgan(':method :url :status :response-time ms', {
    skip: (req) => req.method === 'POST',
  })
)

morgan.token('body', (req) => JSON.stringify(req.body))
app.use(
  morgan(':method :url :status :response-time ms :body', {
    skip: (req) => req.method !== 'POST',
  })
)

app.get('/info', (request, response, next) => {
  Person.find({})
    .then((persons) => {
      const timestamp = Date()
      const info = `<p>Phonebook has info for ${persons.length} people</p><p>${timestamp}</p>`
      response.send(info)
    })
    .catch((error) => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) response.json(person)
      else response.status(404).end()
    })
    .catch((error) => next(error))
})

app.get('/api/persons', (request, response, next) => {
  Person.find({})
    .then((persons) => {
      if (persons) response.json(persons)
      else response.status(404).end()
    })
    .catch((error) => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (!body) {
    return response.status(400).json({
      error: 'person missing',
    })
  }
  if (!body.name || !body.number)
    return response.status(400).json({
      error: 'name or number missing',
    })

  Person.find({ name: body.name })
    .then((person) => {
      if (person.length)
        return response.status(400).json({
          error: 'name must be unique',
        })
      else {
        const newPerson = new Person({
          name: body.name,
          number: body.number,
        })
        return newPerson.save().then((savedPerson) => {
          response.json(savedPerson)
        })
      }
    })
    .catch((error) => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findById(request.params.id)
    .then((person) => {
      if (!person) return response.status(404).end()
      person.name = name
      person.number = number
      return person.save().then((updatedPerson) => {
        response.json(updatedPerson)
      })
    })
    .catch((error) => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (!person) return response.status(404).end()
      return Person.deleteOne(person).then(() => {
        response.status(204).end()
      })
    })
    .catch((error) => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, request, response, next) => {
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

app.use(unknownEndpoint)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
