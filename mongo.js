const mongoose = require('mongoose')


const numberOfArguments = process.argv.length

if (numberOfArguments < 3) {
    console.log('Give password as an argument')
    process.exit(1)
}

if (numberOfArguments === 4) {
    console.log('Name or number missing')
    process.exit(1)
}

if (numberOfArguments > 5) {
    console.log('Too many arguments')
    process.exit(1)
}

const password = process.argv[2]

const url = 
    `mongodb+srv://fullstack:${password}@cluster0.zic59.mongodb.net/phonebook-app?retryWrites=true`

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })

const personSchema = new mongoose.Schema( {
    name: String,
    number: String,
})

const Person = mongoose.model('Person', personSchema)


if (numberOfArguments === 5) {
    const person = new Person( {
        name: process.argv[3],
        number: process.argv[4],
    })
    
    person.save().then(response => {
        console.log(`added ${person.name} number ${person.number} to phonebook`)
        mongoose.connection.close()
    })
} else {
    console.log('phonebook')
    Person.find({}).then(result => {
        result.forEach(person => {
            console.log(person.name, person.number)
        })
        mongoose.connection.close()
    })
}
