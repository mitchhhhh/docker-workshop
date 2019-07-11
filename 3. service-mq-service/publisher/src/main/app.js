const express = require('express')
const bodyParser = require('body-parser')
const amqp = require('amqplib')
const setTimeoutPromise = require('util').promisify(setTimeout)

const app = express()
app.use(bodyParser.json())

const port = process.env.EXPOSED_PORT
const mqName = process.env.MQ_NAME
const mqPort = process.env.MQ_PORT
const queueName = process.env.QUEUE_NAME


const initWebserver = (channel) => {
  app.post('/requests', (req, res) => {
    const body = JSON.stringify(req.body)
    console.log(`Received POST request! Body: ${body}`)
    channel.sendToQueue(queueName, Buffer.from(body))
    res.sendStatus(200)
  })
  
  app.listen(port, () => console.log(`Listening on port ${port}!`))
}

const connectToMq = (uri) => amqp.connect(uri)
    .catch(err => {
      console.error(`[AMQP] - cannot connect to ${uri}`, err)
      return setTimeoutPromise(1000).then(() => connectToMq(uri))
    })

connectToMq(`amqp://${mqName}:${mqPort}`)
  .then((conn) => conn.createChannel())
  .then((channel) => {
    channel.assertQueue(queueName, {
      durable: false
    })
  
    console.log(`Ready to send messages to ${queueName}`)
    initWebserver(channel)
  })



