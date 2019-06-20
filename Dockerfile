FROM node:10

ENV NAME "World"

ADD ./package.json /app/package.json
ADD /src /app/src

WORKDIR /app

CMD npm start