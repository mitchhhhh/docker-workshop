const express = require('express')
const bodyParser = require('body-parser')
const amqp = require('amqplib')
const setTimeoutPromise = require('util').promisify(setTimeout)

const app = express()
app.use(bodyParser.json())

const port = 8080
const appName = 'publisher'

const initWebserver = (channel) => {
  app.post('/requests', (req, res) => {
    console.log('Received POST request!')
    channel.sendToQueue('messages', Buffer.from(JSON.stringify(req.body)))
    res.sendStatus(200)
  })
  
  app.listen(port, () => console.log(`${appName} listening on port ${port}!`))
}

const connectToMq = (uri) => amqp.connect(uri)
    .catch(err => {
      console.error(`[AMQP] - cannot connect to ${uri}`, err)
      return setTimeoutPromise(1000).then(() => connectToMq(uri))
    })

connectToMq('amqp://message-mq:5672')
  .then((conn) => conn.createChannel())
  .then((channel) => {
    channel.assertQueue('messages', {
      durable: false
    })
  
    initWebserver(channel)
  })



