FROM node:12

WORKDIR .

COPY . .

RUN npm install

RUN npm run build

EXPOSE 443

CMD [ "npm", "start" ]