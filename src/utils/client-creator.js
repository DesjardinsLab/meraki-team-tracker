var fs = require('fs');
var prompt = require('prompt');

var clients = JSON.parse(fs.readFileSync('./config/tracked-clients.json', 'utf8'));

var properties = [
  {
    name: 'name',
    required: true
  },
  {
    name: 'img'
  },
  {
    name: 'clientMac',
    required: true
  },
  {
    name: 'clientPhone'
  }
];

prompt.start();

prompt.get(properties, function(err, result) {
  if (err) {
    console.log('Error on input.');
  } else {
    var newClient = {
      name: result.name,
      clientMac: result.clientMac
    }

    if (result.img) {
      newClient.img = result.img;
    }
    if (result.clientPhone) {
      newClient.phone = result.clientPhone;
    }

    clients.push(newClient);

    fs.writeFile('./config/tracked-clients.json', JSON.stringify(clients), function(err) {
      if(err) {
          return console.log(err);
      }

      console.log('Added client ' + result.name + ' to tracking.');
    });
  }
});
