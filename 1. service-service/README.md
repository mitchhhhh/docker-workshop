# Service to Service

In this example there are simply two services, one service sending messages to the other.

## Build and Start

```bash
docker-compose up --build
```

## Sending Messages

Once the service is started, send a POST message to `localhost:8080/requests` with a valid JSON body. The body will forwarded onto the service receiving the messages (the 'Receiver').

For sending HTTP requests, I recommend using Postman.

## Displaying Messages

To display messages, send a GET request to `localhost:8081/messages`.

If you didn't run the services in detached mode you should be able to see lines added to the logs as messages are sent through. If you did run the service in detached mode, use `docker logs` to display the logs of the service(s).

## Docker DNS

Looking at `sender/src/main/app.js` there's the following lines of code:

```javascript
request({
    uri: `http://${receiverAppName}:8081/messages`,
    method: 'POST',
    rejectUnauthorized: false,
    body: req.body,
    headers: {
      'Content-Type': 'application/json',
    },
    json: true,
  })
```

Specifically take note of the uri

```javascript
`http://${receiverAppName}:8081/messages`
```

Note how localhost isn't being provided, `receiverAppName` will resolve to `Receiver` - the name of the container. So the URI will be `http://Receiver:8081/messages`.

So the name of a container can be used as an alias the container's IP address in a similar way that `localhost` is used as an alias for the host machine.

This also means that in circumstances where a container only has to communicate with other containers, it does not need to expose any ports on the host machine and would only be accessible via other containers which do expose ports to the host machine.

Change folders to `2. service-db` to continue.
