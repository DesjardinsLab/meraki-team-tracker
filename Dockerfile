FROM node:5.4.0

RUN mkdir /app
WORKDIR /app
COPY ./ /app/
RUN npm install --production

EXPOSE 4000

CMD ["npm", "start"]
