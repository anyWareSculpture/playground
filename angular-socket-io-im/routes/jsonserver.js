var net = require("net");
var debug = require("debug")("server");
var util = require("util");
var _ = require("underscore");

Array.prototype.remove = function(e) {
  for (var i = 0; i < this.length; i++) {
    if (e == this[i]) { return this.splice(i, 1); }
  }
};

function Game() {
  this.state = Game.states.SLEEP;
  debug("Starting new game...");
}

Game.game = null;
Game.states = {SLEEP: 0, CALL: 1};
Game.shaveAndHaircutMessage = {
  knockpattern: [0,447,318,152,450]
};
//  knockpattern: [0,500,250,250,500]

Game.prototype.stop = function() {
  if (Game.game.timer) {
    clearInterval(Game.game.timer);
    delete Game.game.timer;
  }
  this.state = Game.states.SLEEP;
}

Game.prototype.shaveAndHaircut = function() {
  CyberObject.forEach(function(name, obj) {
    var sendstr = JSON.stringify(Game.shaveAndHaircutMessage);
    debug("writing '" + sendstr + "'");
    obj.write(sendstr + "\n");
  });
}

Game.prototype.proximity = function(obj) {
  if (obj.proximity > 0) {
    if (this.state == Game.states.SLEEP) {
      debug("Entering call state");
      this.state = Game.states.CALL;
      Game.game.timer = setInterval(this.shaveAndHaircut, 10000);
    }
    obj.setActive(true);
  }
  else {
    obj.setActive(false);
    if (_.size(CyberObject.activeobjects) == 0) {
      debug("FIXME: shut down game");
      Game.game.stop();
    }
  }
}

Game.prototype.knockpattern = function(obj, pattern) {
  debug("Got pattern " + JSON.stringify(pattern) + " from " + obj.name);
  var pattern_accepted = (pattern.length == 2 && 
                          pattern[0] > 800 && pattern[0] < 1600 && 
                          pattern[1] > 400 && pattern[1] < 600);
  if (pattern_accepted) {
    CyberObject.forEach(function(name, obj) {
      obj.write(JSON.stringify({cmd: "open_sesame"}) + "\n");
    });
  }
}

/*
 If at least two cyberobjects have joined:
 o Start new Game

 Incoming zero proximity:
 o Set corresponding object to inactive
 o If no objects are active, set game to SLEEP state

 Incoming positive proximity:
 o if no active objects:
   - Initialize game to the CALL state
 o set object to active

*/


function CyberObject(socket) {
  anonclients.push(this);
  this.name = null;
  this.socket = socket;
  this.currdata = "";
}

CyberObject.allobjects = {};
CyberObject.activeobjects = {};

CyberObject.addObject = function(obj) {
  CyberObject.allobjects[obj.name] = obj;
}

CyberObject.removeObject = function(obj) {
  delete CyberObject.activeobjects[obj.name];
  delete CyberObject.allobjects[obj.name];
}

CyberObject.forEach = function(func) {
  for (var c in CyberObject.allobjects) {
    func(c, CyberObject.allobjects[c]);
  }
}

CyberObject.prototype.setActive = function(act) {
  
  this.active = act;
  if (act) {
    CyberObject.activeobjects[this.name] = this;
  }
  else {
    delete CyberObject.activeobjects[this.name];
  }
}

CyberObject.prototype.write = function(data) {
  console.log('writing to socket: ' + JSON.stringify(data));
  this.socket.emit('send:message', { 'user' : 'chatroom', 'text' : data});
  //            obj.socket.write(data);
}

CyberObject.prototype.read = function(data) {
  this.currdata += data;
  
  for (var i=0;i<this.currdata.length;i++) {
    if (this.currdata.charCodeAt(i) === 0x0a) {
      var jsonstring = this.currdata.slice(0, i).trim();
      this.currdata = this.currdata.slice(i);
      if (jsonstring) {
        debug("Received: " + jsonstring);
        try {
          var json = JSON.parse(jsonstring);
          return json;
        }
        catch (err) {
          console.log("Error: " + err + "\n     '" + jsonstring + "'");
        }
      }
    }
  }
  return null;
}

var anonclients = [];

var server = net.createServer(function (socket) {
  var currobj = new CyberObject(socket);

  socket.setTimeout(0);
  socket.setEncoding("utf8");

  socket.addListener("connect", function () {
    socket.write("Greetings, programs!\n");
  });

  socket.addListener("data", function (data) {
    objectReceived(data);
  });
  
  socket.addListener("end", function() {
    if (currobj.name) CyberObject.removeObject(currobj);
    else anonclients.remove(currobj);
    
    CyberObject.forEach(function(name, obj) {
      obj.write(currobj.name + " has left.\n");
    });

    if (Game.game !== null && _.size(CyberObject.allobjects) < 2) {
      debug("Not enough players to continue playing\n");
      Game.game = null;
    }
    
    socket.end();
  });
});

server.listen(7000);

function objectReceived(cyberobj, data) {
    var message = cyberobj.read(data);
    console.log('objectReceived ' + JSON.stringify(data));
    if (message) {
      if (message.hasOwnProperty('login')) {
        debug("Got login: " + JSON.stringify(message));
        cyberobj.name = message.login;
        CyberObject.addObject(cyberobj);
        anonclients.remove(cyberobj);

        if (Game.game === null && _.size(CyberObject.allobjects) >= 2) {
          Game.game = new Game();
        }

        CyberObject.forEach(function(name, obj) {
          if (obj != cyberobj) {
            obj.write(cyberobj.name + " has joined.\n");
          }
        });
      }
      else if (message.hasOwnProperty('proximity')) {
        debug("Got proximity: " + JSON.stringify(message));
        cyberobj.proximity = message.proximity;
        if (cyberobj.proximity > 0) {
          debug("Proximity: " + cyberobj.proximity + " cm");
        }
        else {
          debug("No Proximity");
        }
        CyberObject.forEach(function(name, obj) {
          if (obj != cyberobj) obj.write(cyberobj.name + " proximity is now " + cyberobj.proximity + "\n");
        });
        if (Game.game) Game.game.proximity(cyberobj);
      }
      else if (message.hasOwnProperty('knockpattern')) {
        debug("Got knock pattern");
        if (Game.game) Game.game.knockpattern(cyberobj, message.knockpattern);
      }
      else {
        debug("Got unknown message: " + JSON.stringify(message));
      }
    }
}

module.exports.CyberObject = CyberObject;
module.exports.objectReceived = objectReceived;
