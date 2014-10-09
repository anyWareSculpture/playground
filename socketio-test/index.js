var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var jsonserver = require('./jsonserver');

app.get('/', function(req, res){
  res.sendfile('index.html');
});

io.on('connection', function(socket){
  var currobj = new jsonserver.CyberObject(socket);
  socket.on('object', function(msg){
    console.log(msg);
    jsonserver.objectReceived(currobj, msg);
//    io.emit('object', msg);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
