FROM node:16

COPY package*.json ./

COPY . ./src
WORKDIR /src

RUN npm install

EXPOSE 6000

CMD ["npm", "start"]