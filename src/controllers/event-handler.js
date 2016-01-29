var fs = require('fs');

const VALIDATOR = '79b824bb1a26aa0e07e2c2a38610e12cdcb3e5b0';
const SECRET = 'secret';

module.exports.events = function *(next) {
  if (this.method === 'GET') {
    this.body = VALIDATOR;
  } else if (this.method === 'POST') {
    var body = JSON.stringify(this.request.body) + '\n';
    if (this.request.body.secret !== SECRET) {
      throw new Error('Wrong secret.');
    }
    fs.appendFile('output.txt', body)
    this.body = body
  }
  yield next;
}
