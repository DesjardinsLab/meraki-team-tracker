// load environment variables
require('dotenv').config();

var koa = require('koa');
var route = require('koa-route');
var logger = require('koa-logger')();
var bodyparser = require('koa-bodyparser')();
var eventHandler = require('./controllers/event-handler');

const MERAKI_EVENTS_ROOT = process.env.MERAKI_POST_PATH ? process.env.MERAKI_POST_PATH : '/cmx';
const TEAM = '/team';

var app = koa();

app.use(logger);
app.use(bodyparser);

app.use(route.get(MERAKI_EVENTS_ROOT, eventHandler.events));
app.use(route.post(MERAKI_EVENTS_ROOT, eventHandler.events));
app.use(route.get(TEAM, eventHandler.team));

app.listen(4567);
