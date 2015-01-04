'use strict';

/* Controllers */

function AppCtrl($scope, socket, $location) {

  $scope.name = '';
  $scope.users = [];
  $scope.messages = [];

  // Socket listeners
  // ================

  // socket.on('init', function (data) {
  //   $scope.name = data.name;
  //   $scope.users = data.users;
  // });

  socket.on('send:message', function (message) {
    $scope.messages.push(message);
  });

  socket.on('change:name', function (data) {
    changeName(data.oldName, data.newName);
  });

  socket.on('user:join', function (data) {
    $scope.messages.push({
      user: 'chatroom',
      text: 'User ' + data.name + ' has joined.'
    });
    $scope.users.push(data.name);
  });

  // add a message to the conversation when a user disconnects or leaves the room
  socket.on('user:left', function (data) {
    // TODO socket logout command
    $scope.messages.push({
      user: 'chatroom',
      text: 'User ' + data.name + ' has left.'
    });
    var i, user;
    for (i = 0; i < $scope.users.length; i++) {
      user = $scope.users[i];
      if (user === data.name) {
        $scope.users.splice(i, 1);
        break;
      }
    }
  });


  // Private helpers
  // ===============

  var changeName = function (oldName, newName) {
    // rename user in list of users
    var i;
    for (i = 0; i < $scope.users.length; i++) {
      if ($scope.users[i] === oldName) {
        $scope.users[i] = newName;
      }
    }

    $scope.messages.push({
      user: 'chatroom',
      text: 'User ' + oldName + ' is now known as ' + newName + '.'
    });
  }

  // Methods published to the scope
  // ==============================

  $scope.changeName = function () {
    socket.emit('change:name', {
      name: $scope.newName
    }, function (result) {
      if (!result) {
        alert('There was an error changing your name');
      } else {
        
        changeName($scope.name, $scope.newName);

        $scope.name = $scope.newName;
        $scope.newName = '';
      }
    });
  };

  // Define page flow
  $scope.continue = function () {
    var url = $location.url();
    var newUrl = '';
    switch(url) {
      case '/login'   : newUrl = '/approach'; break;
      case '/approach': newUrl = '/closed';   break;
      case '/closed'  : newUrl = '/shadow';   break;
      case '/shadow'  : newUrl = '/light';   break;
      case '/light'  : newUrl = '/closed';   break;
      default         : '/login';             break;
    }

    $location.url(newUrl);
  };
}


function LoginCtrl($scope, socket, $location) {

  $scope.login = function() {
    socket.emit('command', {
      "login" : $scope.username
    });

    // add to user list
    $scope.users.push($scope.username);

    $scope.continue();
  }
};

function ApproachCtrl($scope, socket, $location) {

  $scope.approach = function() {
    socket.emit('command', {
     "proximity": "1"
    });

    $scope.continue();
  }
};

function ClosedCtrl($scope, socket, $location) {

  $scope.sendMessage = function () {
    socket.emit('send:message',
      $scope.message 
    );

    // add the message to our model locally
    $scope.messages.push({
      user: $scope.name,
      text: $scope.message
    });

    // clear message box
    $scope.message = '';
  };
};

function ShadowCtrl($scope, socket, $location) {
};

function LightCtrl($scope, socket, $location) {
};

