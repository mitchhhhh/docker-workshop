# Service - DB

This example shows how to use a database within docker and allow the data to persist after the database is gone.

The example is a service which receives POST requests over HTTP to the endpoint `/requests` and stores them in the database `exampleDB` in the collection `requests` (collections are similar to tables in a SQL database), these requests can then be retrieved via HTTP as well.

## Run

As per usual, run the example with

```bash
docker-compose up --build
```

Send a POST request to `localhost:8080/requests`.

Then send a GET request to the same URL, should receive what was sent in the POST request.

Bring down the services and bring them back up

```bash
docker-compose down
docker-compose up --build
```

Send another GET request - note that the requests sent to the service before it was brought down are still there. This is through the power of volumes.

## Volumes

Volumes are ways of binding a location within the container to a location outside of the container.

Looking at the `docker-compose.yml` file in this folder, there are two important parts:

```yml
mongodb:
  image: mongo
  ports:
    - 27017:27017
  volumes:
    - type: volume
      source: mongodb_data_volume
      target: /data/db
```

and

```yml
volumes:
  mongodb_data_volume:
```

the second piece of code creates the volume, the first piece connects the volume to the container. In this case the volume is being mounted to the `/data/db` folder.

There are two types of volumes, the type used here is an internal volume, meaning the place that the volume connects to outside of the container is contained within Docker. The alternative maps a directory on the host machine to a directory inside the container.

## Mongo Client

The MongoDB can also be accessed through the mongo client.

Run

```bash
docker run -it --network service-db-network --rm mongo mongo --host requests-db exampleDB
```

while the MongoDb container is running. To execute the same query as what is returned through the GET request, run

```mongo
db.requests.find({})
```

Change folders to `3. service-mq-service` to continue.
