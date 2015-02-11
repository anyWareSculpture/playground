'use strict';

/* Controllers */

function AppCtrl($scope, socket, $location, $rootScope) {
  // Init
  //=================

  $scope.user = {
    name: '',
    proximity: 0
  };
  $scope.messages = [];


  // Socket listeners
  // ================

  socket.on('init', function (data) {
    $scope.users = data;
  });

  socket.on('send:message', function (message) {
    $scope.messages.push(message);
  });

  socket.on('user:login', function (data) { 
    $scope.messages.push({ 
      user: 'chatroom',
      text: 'User ' + data.name + ' has joined.'
    });
    $scope.users[data.name] = data;
  });

  socket.on('user:change', function(data) {
    $scope.messages.push({ 
      user: 'chatroom',
      text: 'User ' + data.name + ' proximity is now ' + data.proximity + '.'
    });
    $scope.users[data.name] = data;
  });

  socket.on('command', function(data) {
    if(data === 'open_sesame') {
      $scope.continue();
    }
  });

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
  $scope.continue = function (routeParams) {
    routeParams = routeParams || {};
    var url = $location.url();
    var newUrl = '';
    switch(url) {
      case '/login'   : newUrl = '/approach'; break;
      case '/approach': newUrl = '/closed';   break;
      case '/closed'  : newUrl = '/shadow';   break;
      case '/shadow'  : newUrl = '/light';    break;
      case '/light'   : newUrl = '/closed';   break;
      default         : '/login';             break;
    }

    // For dev & testing convenience
    if(routeParams.hasOwnProperty('url')) {
      newUrl = routeParams.url;

      socket.emit('user:change', {
        "proximity": "1"
      });

      $scope.user.proximity = 1;
      $scope.users[$scope.user.name].proximity = 1;

      $scope.continue();
    }

    $location.url(newUrl);
  };

  $rootScope.hasUser = function() {
    return $scope.user.name !== '';
  };
}


function LoginCtrl($scope, socket, $location, $routeParams) {
  $scope.login = function() {
    socket.emit('user:login', $scope.user);

    // add to user list
    $scope.users[$scope.user.name] = $scope.user;

    $scope.continue($routeParams);
  }
};

function ApproachCtrl($scope, socket, $location) {

  $scope.approach = function() {
    socket.emit('user:change', {
     "proximity": "1"
    });

    // TODO fix the way current user and user list is stored
    $scope.user.proximity = 1;
    $scope.users[$scope.user.name].proximity = 1;

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

