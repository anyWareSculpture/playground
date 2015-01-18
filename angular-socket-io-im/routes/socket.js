module.exports = function (socket) {
  var jsonserver = require('./jsonserver');
  var currobj = new jsonserver.CyberObject(socket);


  // Listen for events sent from client
  socket.on('user:login', function(data) {
    // data = { name: '' }
    jsonserver.objectReceived(currobj, JSON.stringify({
      "login" : data.name
    }) + "\n");
  });

  socket.on('user:change', function(data) {
    // data = { name: '', proximity: 0 }
    jsonserver.objectReceived(currobj, JSON.stringify(data) + "\n");
  });

  socket.on('user:logout', function(data) {
    //TODO
  });

  socket.on('send:message', function (data) {
    jsonserver.objectReceived(currobj, data + '\n');
  });

  socket.on('command', function (data) {
    jsonserver.objectReceived(currobj, JSON.stringify(data) + '\n');
  });

  socket.emit('init', jsonserver.CyberObject.allobjects);
};
