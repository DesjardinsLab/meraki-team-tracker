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

  return yield next;
}

module.exports.team = function *(next) {
  if (this.method === 'GET') {
    var trackedClientsStatus = {};

    for (var i in TRACKED_CLIENTS) {
      if (TRACKED_CLIENTS.hasOwnProperty(i)) {
        var client = TRACKED_CLIENTS[i];

        // if client has been seen within time interval,
        if ((new Date() - TIME_DELTA) < new Date(client.seenTime)) {
          trackedClientsStatus[client.clientMac] = client;
        }
      }
    }

    this.body = trackedClientsStatus;
  }

  return yield next;
}

module.exports.call = function *(id, next) {
  if (!TWILIO_PHONE_NUMBER || !twilio) {
    this.body = 'Twilio is not configured. Cannot call.';
    return yield next;
  } else if (this.method === 'GET') {
    var targetClient = TRACKED_CLIENTS[id.toLowerCase()];
    var twimlUrl = TWILIO_TWIML_URL ? TWILIO_TWIML_URL : this.request.origin + '/twiml/' + encodeURIComponent(targetClient.name);

    if (targetClient.clientPhone && TWILIO_PHONE_NUMBER) {
      twilio.makeCall({
        to: targetClient.clientPhone,
        from: TWILIO_PHONE_NUMBER,
        url: twimlUrl,
        callerName: TWILIO_CALLER_NAME,
        sendDigits: targetClient.clientExtension ? targetClient.clientExtension : null
      });
      this.body = 'Making call to: ' + id;
    } else if (TWILIO_PHONE_NUMBER) {
      this.body = 'No phone number specified for client: ' + id;
    } else {
      this.body = 'No phone number specified for Twilio.';
    }
  }
  return yield next;
}
