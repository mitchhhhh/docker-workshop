FROM node:10-alpine

ADD ./package.json /app/package.json
ADD ./package-lock.json /app/package-lock.json
ADD /src /app/src

WORKDIR /app

RUN npm install

CMD npm start