// load environment variables
require('dotenv').config({path: 'config/.env'});

var koa = require('koa');
var cors = require('koa-cors')();
var route = require('koa-route');
var koaStatic = require('koa-static')('src/static');
var logger = require('koa-logger')();
var bodyParser = require('koa-bodyparser')();

var eventHandler = require('./controllers/event-handler');

const MERAKI_EVENTS_ROOT = process.env.MERAKI_POST_PATH ? process.env.MERAKI_POST_PATH : '/cmx';
const TEAM = '/team';
const CALL = '/call/:id';

var app = koa();

if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
  console.log('Serving static resources.');
  app.use(koaStatic);
}

app.use(cors);
app.use(logger);
app.use(bodyParser);

app.use(route.get(MERAKI_EVENTS_ROOT, eventHandler.events));
app.use(route.post(MERAKI_EVENTS_ROOT, eventHandler.events));
app.use(route.get(TEAM, eventHandler.team));

app.use(route.post(CALL, eventHandler.call));
app.use(route.post('/twiml/:name', eventHandler.twiml));

app.listen(process.env.PORT ? process.env.PORT : 8080);
