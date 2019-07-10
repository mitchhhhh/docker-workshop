const express = require('express')
const bodyParser = require('body-parser')
const request = require('request-promise-native')

const app = express()
app.use(bodyParser.json())

const port = process.env.SENDER_PORT
const appName = process.env.SENDER_NAME
const receiverAppName = process.env.RECEIVER_NAME

app.post('/requests', (req, res) => {
  console.log('Received POST request!')
  request({
    uri: `http://${receiverAppName}:8081/messages`,
    method: 'POST',
    rejectUnauthorized: false,
    body: req.body,
    headers: {
      'Content-Type': 'application/json',
    },
    json: true,
  }).promise()
    .then((val) => {
      res.status(200).send(val)
    }).catch((err) => {
      res.status(400).send(err)
    })
})

app.listen(port, () => console.log(`${appName} listening on port ${port}!`))