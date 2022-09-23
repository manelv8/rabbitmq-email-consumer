FROM node:lts-alpine

RUN mkdir -p /home/node/consumer/node_modules && chown -R node:node /home/node/consumer
WORKDIR /home/node/consumer

COPY package.json ./
USER node
RUN npm i

COPY --chown=node:node . .

CMD ["npm", "run", "cleandist"]
CMD ["npm", "run", "build"]
CMD ["npm", "run", "prod"]