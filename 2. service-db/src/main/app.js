var mongoClient = require('mongodb').MongoClient
const express = require('express')
const bodyParser = require('body-parser')
const setTimeoutPromise = require('util').promisify(setTimeout)

const app = express()
app.use(bodyParser.json())

const port = process.env.SERVICE_PORT || 8080
const mongoHost = process.env.MONGODB_HOST || 'request-db'
const mongoPort = process.env.MONGODB_PORT || 27017

const url = `mongodb://${mongoHost}:${mongoPort}/`

const initWebserver = (collection) => {
  app.post('/requests', (req, res) => {
    collection.insertOne(req.body)
      .then(() => {
        console.log(`Doc ${JSON.stringify(req.body)} inserted.`)
        res.sendStatus(200)
      })
      .catch((err) => {
        console.error(err)
        res.sendStatus(400)
      })
  })

  app.get('/requests', (req, res) => {
    collection.find({}).toArray()
      .then((results) => {
        console.log( `Returning results: ${JSON.stringify(results)}`)
        res.status(200).send(results)
      })
      .catch((err) => {
        console.error(err)
        res.status(400).send(err)
      })
  })

  app.listen(port, () => console.log(`Listening on port ${port}!`))
}

const connectToMongoDb = (uri) =>
  mongoClient.connect(uri, { useNewUrlParser: true })
    .catch(err => {
      console.error(`[MongoDb] - cannot connect to ${uri}`, err)
      return setTimeoutPromise(1000).then(() => connectToMongoDb(uri))
    })

connectToMongoDb(url)
  .then((db) => {
    initWebserver(db.db("exampleDB").collection("requests"))
  })