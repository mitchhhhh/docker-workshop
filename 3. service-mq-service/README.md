# Service - MQ - Service

This example builds on the `service-service` example, but rather than sending the messages directly to the service they are going via a message queue. Then to show off a couple of other features, the subscriber puts the data in a redis instance.

## Message Queue

The choice of MQ used here is Rabbit MQ, which supports AMQP (Apache Message Queue Protocol), primarily due to simplicity of setup configuration. The MQ could be swapped out for another (like Kafka) with little code changes. 

## Networks

A network in Docker defines where a collection of containers can communicate with each other, by default when starting up containers through `docker-compose` all the containers are placed on the same network. Running `docker-compose up` in `1. service-service`, one of the first lines will be `Creating network "1service-service_default" with the default driver`, this is the network that all the services will run on.

Note how the `docker-compose.yml` file in this folder defines two networks at the bottom:

```yml
networks:
  publisher_network:
    name: publisher_network
  
  subscriber_network:
    name: subscriber_network
```

Two separate networks are being defined: the `publisher_network` and the `subscriber_network`. Each service can there be added to one or more networks using the `networks` property. For example `message-mq` is added to both networks:

```yml
message-mq:
    image: rabbitmq
    container_name: message-mq
    ports:
      - 5672:5672
    networks:
      - publisher_network
      - subscriber_network
```

As a result if the publisher service tried to send a message to the subscriber service directly (e.g `http://subscriber:...`) it would be unable to resolve the address because the `subscriber` domain name isn't defined on the `publisher_network` network.

## Run

Running the example

```bash
docker-compose up --build
```

The publisher and subscriber services are trying to connect to the MQ every second but the MQ will take a few seconds to come up, so there will be some errors logged at the beginning, but once the MQ starts up they should stop.

Recommend not running this in detached mode, will be easier to see what's going on with all of the logging outputs attached.

Same as the `service-service` example, send a post request to `/requests` on port `8080`, should see the message received by the publisher and then the subscriber and finally the request will be pushed to redis.

## Accessing Redis

While the redis container is still up, run the following command

```bash
docker run -it --network subscriber_network --rm redis redis-cli -h message-cache
```

This will run an instance of `redis-cli` and connect to the `message-cache` container (which is expects to be a redis instance).

Redis in very basic terms is a hashmap, where the values in the map can be simple strings or complex object-like datastructures. For our purposes it be just used as a simple `string -> string` map.

The format of the keys that are being put into the redis instance are `message 1`, `message 2`, etc.

Fetch the value for a key:

```redis-cli
GET "message 1"
```

We need quotes if there's spaces in the key.

Can also find all the keys that have been inserted:

```redis-cli
KEYS message*
```

This is only a very quick look at Redis.

Try their tutorial [here](http://try.redis.io/) and check out the API reference [here](https://redis.io/commands).
