const events = require('events');
const net = require('net');
const channel = new events.EventEmitter();

channel.clients = {};
channel.subscriptions = {};

channel.on('join', function(id, client) {
  this.clients[id] = client;
  this.subscriptions[id] = function (senderId, message) {
    if (id !== senderId) {
      this.clients[id].write(message);
    }
  }
  this.on('broadcast', this.subscriptions[id]);
  console.log(`${id} has joined`);
});

channel.on('leave', function(id) {
  channel.removeListener('broadcast', this.subscriptions[id]);
  channel.emit('broadcast', id, `${id} has left the chat.\n`)
})

let server = net.createServer(function (client) {
  let id = client.remoteAddress + ':' + client.remotePort;
  channel.emit('join', id, client);
  client.on('data', function (data) {
    data = data.toString();
    channel.emit('broadcast', id, data);
  });
  client.on('close', function() {
    channel.emit('leave', id);
  });
});

server.listen(8888);