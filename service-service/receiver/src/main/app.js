const express = require('express')
const bodyParser = require('body-parser')

const app = express()
app.use(bodyParser.json())

const port = process.env.RECEIVER_PORT
const appName = process.env.RECEIVER_NAME

const messages = []
app.post('/messages', (req, res) => {
  const message = JSON.stringify(req.body)
  console.log(`Received message: ${message}`)
  messages.push(message)
  res.sendStatus(200)
})

app.get('/messages', (req, res) => {
  console.log('Received GET request!')
  res.send(messages)
})

app.listen(port, () => console.log(`${appName} listening on port ${port}!`))