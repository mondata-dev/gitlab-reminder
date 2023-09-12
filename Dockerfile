FROM node:18-slim

WORKDIR /app

ADD package.json package-lock.json /app
RUN npm install

ADD src /app/src

CMD ["npm", "start"]
