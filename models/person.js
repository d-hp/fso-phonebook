const mongoose = require('mongoose')

const url = process.env.MONGODB_URI
console.log('connecting to...', url)

mongoose
  .connect(url)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((err) => {
    console.log('error connecting to MongoDB:', err.message)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
  },
  number: {
    type: String,
    minLength: 8,
    validate: {
      validator: (v) => {
        // return /\d{2}-\d{6}/.test(v)
        return /^\d{2,3}-\d{6,}$/.test(v)
      },
      message: (props) => `${props.value} is not a valid phone number.`,
    },
    required: [true, 'User phone number required'],
  },
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

module.exports = mongoose.model('Person', personSchema)
// import mongoDB setup module into index.js using const Person = require('./models/person')
