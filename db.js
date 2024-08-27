const mongoose = require('mongoose')
require('dotenv').config()

const mongoURL = process.env.MONGODB_URL_LOCAL

//set up mongodb connection
mongoose.connect(mongoURL)

//get the default connection
//mongoose maintains a default connection object represting the Mongodb connection
const db = mongoose.connection

//define event listeners for database connection

db.on('connected', ()=>{
    console.log('connected to mongodb server')
})

db.on('error', (err)=>{
    console.error(`mongodb connection error: ${err}`)
})

db.on('disconnected', () => {
    console.log('mongodb disconnected');
})

module.exports = db