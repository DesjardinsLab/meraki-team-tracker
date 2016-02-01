var fs = require('fs');

const VALIDATOR = process.env.VALIDATOR ? process.env.VALIDATOR : '';
const SECRET = process.env.SECRET ? process.env.SECRET : 'secret';
const TIME_DELTA = process.env.TIME_DELTA ? process.env.TIME_DELTA : 90000;
// build associative array of tracked clients.
const TRACKED_CLIENTS = (function () {
  var trackedClientsData = JSON.parse(fs.readFileSync('./config/tracked-clients.json', 'utf8'));
  var trackedClientsByMac = {};

  for (var i = 0; i < trackedClientsData.length; i++) {
    trackedClientsByMac[trackedClientsData[i].clientMac] = trackedClientsData[i];
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

        if (typeof TRACKED_CLIENTS[observation.clientMac] !== 'undefined') {
          TRACKED_CLIENTS[observation.clientMac] = {
            clientMac: observation.clientMac,
            seenTime: observation.seenTime,
            name: TRACKED_CLIENTS[observation.clientMac].name,
            img: TRACKED_CLIENTS[observation.clientMac].img
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
