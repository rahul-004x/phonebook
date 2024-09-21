const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person')
require('dotenv').config()

app.use(express.json())
app.use(cors())
app.use(express.static('dist'))

const customLogger = (req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    req.customBody = JSON.stringify(req.body)
  }
  next()
}

app.use(customLogger)

morgan.token('body', (req) => req.customBody || '')

app.use(morgan((tokens, req, res) => {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'),
    '-',
    tokens['response-time'](req, res),
    'ms',
    tokens.body(req, res),
  ].join(' ')
}))

app.get('/api/persons', (request, response) => {
  Person.find().then(persons => {
    response.json(persons)
  }).catch(() => {
    response.status(500).json({ error: 'Internal server error' })
  })
})

app.get('/info', (request, response) => {
  Person.find().then(persons => {
    const listOfEntries = persons.length
    const currentTime = new Date()

    response.send(
      `<p>Phonebook has info for ${listOfEntries} persons</p>
      <p>${currentTime}</p>`
    )
  }).catch(() => {
    response.status(500).json({ error: 'Internal server error' })
  })
})

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then(person => {
    if (person) {
      response.json(person);
    } else {
      response.status(404).json({ error: 'Person not found' })
    }
  }).catch(() => {
    response.status(500).json({ error: 'Internal server error' })
  })
})

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({ error: 'Name or number is missing' })
  }

  if (body.name.length < 3) {
    return response.status(400).json({ error: 'Name should be at least 3 characters' })
  }

  const phoneRegex = /^\d{2,3}-\d+$/
  if (body.number.length < 8 || !phoneRegex.test(body.number)) {
    return response.status(400).json({ error: 'Number has atleast 8 character and follows the  format 09-298320 or 092-928320' })
  }

  Person.findOne({ name: body.name }).then(existingPerson => {
    if (existingPerson) {
      return response.status(400).json({ error: 'Name must be unique' })
    }

    const newPerson = new Person({
      name: body.name,
      number: body.number
    })

    newPerson.save().then(savedPerson => {
      response.json(savedPerson)
    }).catch(() => {
      response.status(500).json({ error: 'Failed to save person' })
    })
  }).catch(() => {
    response.status(500).json({ error: 'Internal server error' })
  })
})


app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id

  Person.findByIdAndDelete(id)
    .then((result) => {
      if (result) {
        response.status(204).end()
      } else {
        response.status(404).json({ error: 'Person not found' })
      }
    })
    .catch((error) => {
      console.error('Error deleting person:', error)
      response.status(500).json({ error: 'Internal server error' })
    })
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const phoneRegex = /^\d{2,3}-\d+$/
  if (body.number.length < 8 || !phoneRegex.test(body.number)) {
    return response.status(400).json({ error: 'The number should be 8 digit long and follows the  format 09-298320 or 092-928320' })
  }
  const note = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, note, { new: true, runValidators:true, context:'query' })
    .then(updatedNote => {
      response.json(updatedNote)
    })
    .catch(error => next(error))
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
