// load environment variables
require('dotenv').config({path: 'config/.env'});

var koa = require('koa');
var cors = require('koa-cors')();
var route = require('koa-route');
var koaStatic = require('koa-static')('src/static');
var logger = require('koa-logger')();
var bodyparser = require('koa-bodyparser')();
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
app.use(bodyparser);

app.use(route.get(MERAKI_EVENTS_ROOT, eventHandler.events));
app.use(route.post(MERAKI_EVENTS_ROOT, eventHandler.events));
app.use(route.get(TEAM, eventHandler.team));
app.use(route.get(CALL, eventHandler.call));

app.use(route.post('/twiml/:name', function *(name, next) {
  this.body = '<?xml version="1.0" encoding="UTF-8"?><Response><Pause /><Say voice="woman" language="fr">Bonjour, ' + name + '. Vous êtes demandé au kiosque.</Say></Response>';
  this.type = 'application/xml; charset=utf-8';
  return yield next;
}));

app.listen(process.env.PORT ? process.env.PORT : 8080);
