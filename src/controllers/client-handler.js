var fs = require('fs');

const PATH = './config/tracked-clients.json';
const DEFAULT_AVATAR = '/assets/default_avatar.png'
const CLIENTS = [];

fs.access(PATH, fs.F_OK, function (err) {
  if (!err) {
    CLIENTS = JSON.parse(fs.readFileSync(PATH, 'utf8'));
  } else {
    console.log('File does not exist, will create new file.');
  }
});

module.exports.addClient = function *(next) {
  if (this.request.body.name && this.request.body.clientMac) {
    var toAdd = {
      name: this.request.body.name,
      clientMac: this.request.body.clientMac
    };
    if (this.request.body.img) {
      toAdd.img = this.request.body.img;
    }
    if (this.request.body.clientPhone) {
      toAdd.clientPhone = this.request.body.clientPhone;
      if (this.request.body.clientExtension) {
        toAdd.clientExtension = this.request.body.clientExtension;
      }
    }
    CLIENTS.push(toAdd);

    fs.writeFileSync(PATH, JSON.stringify(CLIENTS));
  } else {
    throw new Error("Fields 'name' and 'clientMac' must be defined.", 401);
  }
  yield next;
};

module.exports.modifyClient = function *(clientMac, next) {
  if (clientMac) {
    var targetClient = CLIENTS.filter(function (item) {
      return item.clientMac === clientMac;
    })[0];

    targetClient = {
      clientMac: clientMac,
      name: this.request.body.name || targetClient.name,
      img: this.request.body.img || targetClient.img,
      clientPhone: this.request.body.clientPhone || targetClient.clientPhone,
      clientExtension: this.request.body.clientExtension || targetClient.clientExtension
    };

    fs.writeFileSync(PATH, JSON.stringify(CLIENTS));
  }
  yield next;
}
