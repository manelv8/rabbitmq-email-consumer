FROM node:lts-alpine

RUN mkdir -p /home/node/consumer/node_modules && chown -R node:node /home/node/consumer
WORKDIR /home/node/consumer

COPY package.json ./
USER node
RUN npm i

COPY --chown=node:node . .

CMD ["npm", "run", "prod"]