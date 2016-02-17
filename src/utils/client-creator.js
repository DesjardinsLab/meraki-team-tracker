var fs = require('fs');
var prompt = require('prompt');

var path = './config/tracked-clients.json';
var clients = [];

fs.access(path, fs.F_OK, function (err) {
  if (!err) {
    clients = JSON.parse(fs.readFileSync(path, 'utf8'));
  } else {
    console.log('File does not exist, will create new file.');
  }
});

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
  },
  {
    name: 'clientExtension'
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

    fs.writeFile(path, JSON.stringify(clients), function(err) {
      if(err) {
          return console.log(err);
      }

      console.log('Added client ' + result.name + ' to tracking.');
    });
  }
});
