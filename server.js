const express = require('express')
const app = express()
const db = require('./db')
require('dotenv').config()

const bodyParser = require('body-parser')
app.use(bodyParser.json())
const PORT = process.env.PORT || 3000

//Import the router files
const userRoutes = require('./routes/userRouter')
const candidatesRoutes = require('./routes/candidatesRouter.js')

//use the router files
app.use('/user', userRoutes)
app.use('/candidate', candidatesRoutes)

app.listen(PORT, ()=>{ 
    console.log(`listening at port number ${PORT}`)
})