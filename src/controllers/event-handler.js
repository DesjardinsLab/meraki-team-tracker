var fs = require('fs');

var twilio = false;

if (process.env.TWILIO_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilio = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
}

const VALIDATOR = process.env.VALIDATOR ? process.env.VALIDATOR : '';
const SECRET = process.env.SECRET ? process.env.SECRET : 'secret';
const TIME_DELTA = process.env.TIME_DELTA ? process.env.TIME_DELTA : 90000;

const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER ? process.env.TWILIO_PHONE_NUMBER : false;
const TWILIO_TWIML_URL = process.env.TWILIO_TWIML_URL ? process.env.TWILIO_TWIML_URL : null;
const TWILIO_CALLER_NAME = process.env.TWILIO_CALLER_NAME ? process.env.TWILIO_CALLER_NAME : null;
// build associative array of tracked clients.
const TRACKED_CLIENTS = (function () {
  var trackedClientsData = JSON.parse(fs.readFileSync('./config/tracked-clients.json', 'utf8'));
  var trackedClientsByMac = {};

  for (var i = 0; i < trackedClientsData.length; i++) {
    var trackedClientData = trackedClientsData[i];
    trackedClientData.clientMac = trackedClientData.clientMac.toLowerCase();

    trackedClientsByMac[trackedClientsData[i].clientMac.toLowerCase()] = trackedClientsData[i];
  }

  return trackedClientsByMac;
})();

module.exports.events = function *(next) {
  if (this.method === 'GET') {
    this.body = VALIDATOR;
  } else if (this.method === 'POST') {
    if (this.request.body.type === 'DevicesSeen') {
      for (var i = 0; i < this.request.body.data.observations.length; i++) {
        var observation = this.request.body.data.observations[i];
        observation.clientMac = observation.clientMac.toLowerCase();

        if (typeof TRACKED_CLIENTS[observation.clientMac] !== 'undefined') {
          TRACKED_CLIENTS[observation.clientMac] = {
            clientMac: observation.clientMac,
            seenTime: observation.seenTime,
            name: TRACKED_CLIENTS[observation.clientMac].name,
            img: TRACKED_CLIENTS[observation.clientMac].img,
            clientPhone: TRACKED_CLIENTS[observation.clientMac].clientPhone,
            clientExtension: TRACKED_CLIENTS[observation.clientMac].clientExtension
          };
        }
      }
    }
    if (this.request.body.secret !== SECRET) {
      throw new Error('Wrong secret.');
    }
    this.body = this.request.body;
  }

  yield next;
}

module.exports.team = function *(next) {
  if (this.method === 'GET') {
    var trackedClientsStatus = {};
    var cleanOutput = [];

    for (var i in TRACKED_CLIENTS) {
      if (TRACKED_CLIENTS.hasOwnProperty(i)) {
        var client = TRACKED_CLIENTS[i];

        // if client has been seen within time interval,
        if ((new Date() - TIME_DELTA) < new Date(client.seenTime)) {
          trackedClientsStatus[client.clientMac] = client;

          // filter out phone number
          cleanOutput.push({
            name: client.name,
            img: client.img,
            seenTime: client.seenTime,
            clientMac: client.clientMac
          });
        }
      }
    }

    this.body = trackedClientsStatus;
  }

  yield next;
}

const CALL_LIMIT_INTERVAL = process.env.TWILIO_CALL_LIMIT_INTERVAL ? process.env.TWILIO_CALL_LIMIT_INTERVAL : 0;
const RESTRICTED_CALLS = {};

var handleCallLimit = function (id) {
  if (RESTRICTED_CALLS[id.toLowerCase()]) {
    delete RESTRICTED_CALLS[id.toLowerCase()];
    console.log('Call limit has been cleared for: ' + TRACKED_CLIENTS[id.toLowerCase()].name);
  }
};

var limitCalls = function (id) {
  if (!RESTRICTED_CALLS[id.toLowerCase()] && CALL_LIMIT_INTERVAL > 0) {
    RESTRICTED_CALLS[id.toLowerCase()] = setTimeout(handleCallLimit, CALL_LIMIT_INTERVAL, id);
  }
};

const TWILIO_SECRET = process.env.TWILIO_SECRET

module.exports.call = function *(id, next) {
  // throw error if request secret does not match env secret
  if (TWILIO_SECRET && TWILIO_SECRET !== this.request.body.secret) {
    this.status = 401;
    throw new Error('Unauthorized', 401);
  }
  // throw error if target has been recently called
  else if (RESTRICTED_CALLS[id.toLowerCase()]) {
    this.status = 403;
    throw new Error('Delay not met', 403);
  }

  if (!TWILIO_PHONE_NUMBER || !twilio) {
    this.body = 'Twilio is not configured. Cannot call.';
    return yield next;
  } else if (this.method === 'POST') {
    var targetClient = TRACKED_CLIENTS[id.toLowerCase()];
    var twimlUrl = TWILIO_TWIML_URL ? TWILIO_TWIML_URL : this.request.origin + '/twiml/' + encodeURIComponent(targetClient.name);

    if (targetClient.clientPhone && TWILIO_PHONE_NUMBER) {
      twilio.makeCall({
        to: targetClient.clientPhone,
        from: TWILIO_PHONE_NUMBER,
        url: twimlUrl,
        callerName: TWILIO_CALLER_NAME,
        sendDigits: targetClient.clientExtension ? targetClient.clientExtension : null
      }, function (err, responseData) {
        if (err) {
          console.log(err);
        } else {
          limitCalls(id);
        }
      });
      this.body = 'Making call to: ' + id;
    } else if (TWILIO_PHONE_NUMBER) {
      this.body = 'No phone number specified for client: ' + id;
    } else {
      this.body = 'No phone number specified for Twilio.';
    }
  }
  yield next;
}

// parses the twilio message for "%n" and replaces it with the name.
var addNameToMessage = function (msg, name) {
  return msg.replace('%n', name);
}

module.exports.twiml = function *(name, next) {
  this.body = '<?xml version="1.0" encoding="UTF-8"?><Response><Pause /><Say voice="woman" language="' +
    process.env.TWILIO_TWIML_LANGUAGE + '">' +
    addNameToMessage(process.env.TWILIO_TWIML_MSG, name) + '</Say></Response>';
  this.type = 'application/xml; charset=utf-8';
  return yield next;
}
