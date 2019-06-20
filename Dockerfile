FROM node:10

ADD ./package.json /app/package.json
ADD /src /app/src

WORKDIR /app

CMD npm start