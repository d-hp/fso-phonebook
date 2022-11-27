const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log(
    'Please provide the password as an argument: node mongo.js <password>'
  )
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://phonedb:${password}@cluster0.hnsk00i.mongodb.net/?retryWrites=true&w=majority`

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

// Create a new user if app is executed with 5 arguments
if (process.argv.length === 5) {
  mongoose
    .connect(url)
    .then((result) => {
      console.log('connected')

      const person = new Person({
        name: process.argv[3],
        number: process.argv[4],
      })

      console.log(`added ${person.name} number ${person.number} to phonebook`)
      return person.save()
    })
    .then(() => {
      mongoose.connection.close()
    })
    .catch((err) => console.log(err))
}

// Print all documents within collection if app is executed with 3 arguments
if (process.argv.length === 3) {
  mongoose.connect(url).then((result) => {
    Person.find({}).then((result) => {
      console.log(`phonebook:`)

      result.forEach((person) => {
        console.log(`${person.name} ${person.number}`)
      })

      mongoose.connection.close()
    })
  })
}
