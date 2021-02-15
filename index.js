require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()

app.use(cors())
app.use(express.static('build'))
app.use(express.json())

const tiny = ':method :url :status :res[content-length] - :response-time ms'
morgan.token('data', (request, response) => {
    return JSON.stringify(request.body)
})
app.use(morgan(`${tiny} :data`))



app.get('/', (request, response) => {
    response.send('<h1>Hello World and the rest of the Universe!</h1>')
})

app.get('/info', (request, response, next) => {
    Person.countDocuments({})
        .then(count => {
            response.send(
                `<p>Phonebook has info for ${count} people</p>
                 <p>${new Date()}</p>`
            )
        })
        .catch(error => next(error))
}) 


app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
      response.json(persons)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if(person) {
                response.json(person)   
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
    const body = request.body

    
    if(!body.name) {
        return response.status(400).json({
            error: 'name missing'
        })
    }
    

    if(!body.number) {
        return response.status(400).json({
            error: 'number missing'
        })
    }

    const person = new Person({
        name: body.name,
        number: body.number,
    })

    /* console.log(JSON.stringify(person)) */
    
    person
        .save()
        .then(savedPerson => {
            response.json(savedPerson)
        })  
        .catch(error => next(error))  
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    const person = {
        name: body.name,
        number: body.number
    }

    Person.findByIdAndUpdate(request.params.id, person, { new: true})
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

/* Middleware */

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknow endpoint'})
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.log(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send( { error: 'malformatted id' } )
    }
    if (error.name === 'ValidationError') {
        return response.status(400).json( { error:  error.message} ) /* 'name must be unique' */
    }

    next(error)
}
app.use(errorHandler)


/* Helper functions */

const generateId = () => {
    return Math.floor((Math.random() * 1000) + 1)
}


/* 
let persons = [
    {
        name: "Arto Hellas",
        number: "040-123456",
        id: 1
    },
    {
        name: "Ada Lovelace",
        number: "39-44-5323523",
        id: 2
    },
    {
        name: "Dan Abramov",
        number: "12-43-234345",
        id: 3
      },
      {
        name: "Mary Poppendieck",
        number: "39-23-6423122",
        id: 4
      }
]
*/
