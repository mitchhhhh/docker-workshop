const express = require('express')
const bodyParser = require('body-parser')
const amqp = require('amqplib')
const redis = require('redis')
const setTimeoutPromise = require('util').promisify(setTimeout)


const app = express()
app.use(bodyParser.json())

const mqName = process.env.MQ_NAME
const mqPort = process.env.MQ_PORT
const queueName = process.env.QUEUE_NAME
const redisName = process.env.REDIS_NAME
const redisPort = process.env.REDIS_PORT

const redisClient = redis.createClient({
  host: redisName,
  port: redisPort,
  retry_strategy: () => 1000 // retry every 1000ms
})

var messageCount = 0

const connectToMq = (uri) => amqp.connect(uri)
    .catch(err => {
      console.error(`[AMQP] - cannot connect to ${uri}`, err)
      return setTimeoutPromise(1000).then(() => connectToMq(uri))
    })


connectToMq(`amqp://${mqName}:${mqPort}`)
    .then((connection) => connection.createChannel())
    .then((channel) => {

      channel.assertQueue(queueName, { durable: false })
      console.log(`Subscribed to ${queueName}`)

      channel.consume(queueName, (msg) => {
        const msgContents = msg.content.toString()

        console.log(`Received a message: ${msgContents}`)
        redisClient.set(`message ${++messageCount}`, msgContents)
      }, { noAck: true })
    })
