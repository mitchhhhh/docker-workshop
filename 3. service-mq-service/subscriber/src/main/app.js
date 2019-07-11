const express = require('express')
const bodyParser = require('body-parser')
const amqp = require('amqplib')
const redis = require('redis')
const setTimeoutPromise = require('util').promisify(setTimeout)


const app = express()
app.use(bodyParser.json())

const redisClient = redis.createClient({
  host: 'message-cache',
  port: 6379,
  retry_strategy: () => 1000 // retry every 1000ms
})

var messageCount = 0

const connectToMq = (uri) => amqp.connect(uri)
    .catch(err => {
      console.error(`[AMQP] - cannot connect to ${uri}`, err)
      return setTimeoutPromise(1000).then(() => connectToMq(uri))
    })


connectToMq('amqp://message-mq:5672')
    .then((connection) => connection.createChannel())
    .then((channel) => {
      channel.assertQueue('messages', { durable: false })
      console.log("Waiting for messages!")
      channel.consume('messages', (msg) => {
        console.log('received message!')
        redisClient.set(`message ${++messageCount}`, msg.content.toString())
      }, { noAck: true })
    })
