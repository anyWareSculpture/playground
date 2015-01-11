module.exports = function (socket) {
  var jsonserver = require('./jsonserver');
  var currobj = new jsonserver.CyberObject(socket);

  // socket.on('object', function (data){
  //   console.log(data);
  //   jsonserver.objectReceived(currobj, data);
  //   socket.emit('object', data);
  // });

  // send the new user their name and a list of users
  socket.emit('init', {
    name: currobj.name,
    users: currobj.allObjects
  });

  // notify other clients that a new user has joined
  // socket.broadcast.emit('user:join', {
  //   name: name
  // });

  // broadcast a user's message to other users
  socket.on('send:message', function (data) {
     // console.log(data);
    jsonserver.objectReceived(currobj, data + '\n');
    // socket.broadcast.emit('send:message', {
    //   user: name,
    //   text: data.message
    // });
  });

  socket.on('command', function (data) {
    jsonserver.objectReceived(currobj, JSON.stringify(data) + '\n');
  })

  // clean up when a user leaves, and broadcast it to other users
  // socket.on('disconnect', function () {
  //   socket.broadcast.emit('user:left', {
  //     name: name
  //   });
  //   userNames.free(name);
  // });
};
