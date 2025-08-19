const express = require('express')
const app = express()
require('dotenv').config()
const cors = require('cors')
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.use(cors({
    origin: 'http://localhost:5173', // Allow requests from your frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    credentials: true, // Allow cookies or auth headers if needed
}));


app.get('/', (req, res) => {
    res.send('Hello World!')
})
const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})