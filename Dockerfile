FROM node:5.5-slim

RUN mkdir /app

WORKDIR /app

COPY ./ /app/
RUN npm install --production

EXPOSE 4000

CMD ["npm", "run", "prod"]
