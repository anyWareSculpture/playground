'use strict';

/* Controllers */

function AppCtrl($scope, socket, $location) {

  // Initialize
  // ==========



  // Socket listeners
  // ================

  socket.on('init', function (data) {
    $scope.user = {
      name: '',
      proximity: 0
    };
    $scope.users = [];
    $scope.messages = [];
  });

  socket.on('send:message', function (message) {
    $scope.messages.push(message);

    if(message.text.search('open_sesame') >= 0) {
      $scope.continue();
    }
  });

  // socket.on('user:join', function (data) { 
  //   $scope.messages.push({ 
  //     user: 'chatroom',
  //     text: 'User ' + data.name + ' has joined.'
  //   });
  //   $scope.users.push(data.name);
  // });

  // // add a message to the conversation when a user disconnects or leaves the room
  // socket.on('user:left', function (data) {
  //   // TODO socket logout command
  //   $scope.messages.push({
  //     user: 'chatroom',
  //     text: 'User ' + data.name + ' has left.'
  //   });
  //   var i, user;
  //   for (i = 0; i < $scope.users.length; i++) {
  //     user = $scope.users[i];
  //     if (user === data.name) {
  //       $scope.users.splice(i, 1);
  //       break;
  //     }
  //   }
  // });

  // Define page flow
  $scope.continue = function () {
    var url = $location.url();
    var newUrl = '';
    switch(url) {
      case '/login'   : newUrl = '/approach'; break;
      case '/approach': newUrl = '/closed';   break;
      case '/closed'  : newUrl = '/shadow';   break;
      case '/shadow'  : newUrl = '/light';   break;
      case '/light'   : newUrl = '/closed';   break;
      default         : '/login';             break;
    }

    $location.url(newUrl);
  };
}


function LoginCtrl($scope, socket, $location) {

  $scope.login = function() {
    socket.emit('command', {
      "login" : $scope.user.name
    });

    // add to user list
    $scope.users.push($scope.user);

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

  $scope.sendMessage = function (msg) {
    var message = msg || $scope.message || '';

    socket.emit('send:message',
      JSON.stringify(message)
    );

    // add the message to our model locally
    $scope.messages.push({
      user: $scope.user.name,
      text: message
    })

    // clear message box
    $scope.message = '';
  };

  $scope.respondCorrect = function() {
    $scope.sendMessage(
      { 'knockpattern': [1000, 500]}
    );
  };

  $scope.respondIncorrect = function() {
    $scope.sendMessage(
      { 'knockpattern': [500, 500, 500]}
    );
  };
};

function ShadowCtrl($scope, socket, $location) {
};

function LightCtrl($scope, socket, $location) {
};

