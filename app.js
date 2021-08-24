const express = require('express')
const app = express()
require('dotenv').config();

app.use(express.static('public'));

// Middleware CORS
const cors = require('cors');
app.use(cors());

app.get('/', (req, res) => {
    res.status(200).send('Hello world')
})




const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})