'use strict';

/* Controllers */

angular.module('myApp.controllers', [])

  .controller(
    'AppCtrl', 
    ['$scope', 'socket', '$location', '$rootScope', 
    function ($scope, socket, $location, $rootScope) {
      // Init
      //=================

      $scope.user = {
        name: '',
        proximity: 0,
        handshake: false,
      };
      $scope.messages = [];


      // Socket listeners
      // ================

      socket.on('init', function (data) {
        $scope.users = data || {};
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

      socket.on('user:change', function (data) {
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

      socket.on('user:logout', function (data) {
        // remove user from user list
        delete $scope.users[data.name]
      });

      // Define page flow
      $scope.continue = function (options) {
        options = options || {};
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

        // redirect to supplied url
        if(options.hasOwnProperty('url')) {
          newUrl = options.url;

          // if redirecting from login, proximity is not yet set
          // for easy of dev and testing, set proximity
          if($scope.user.proximity <= 0) {
            socket.emit('user:change', {
              "proximity": "1"
            });

            $scope.user.proximity = 1;
            $scope.users[$scope.user.name].proximity = 1;
          }

        }

        $location.url(newUrl);
      };

      $rootScope.hasUser = function() {
        return $scope.user.name !== '';
      };
    }
 ])

  .controller('LoginCtrl', ['$scope', 'socket', '$location', '$routeParams', function($scope, socket, $location, $routeParams) {
    $scope.login = function() {
      socket.emit('user:login', $scope.user);

      // add to user list
      $scope.users[$scope.user.name] = $scope.user;

      $scope.continue($routeParams);
      }
  }])

  .controller('ApproachCtrl', ['$scope', 'socket', '$location', function($scope, socket, $location) {
    $scope.approach = function() {
      socket.emit('user:change', {
       "proximity": "1"
      });

      $scope.user.proximity = 1;
      $scope.users[$scope.user.name].proximity = 1;

      $scope.continue();
   }
  }])

  .controller('ClosedCtrl', ['$scope', 'socket', '$location', function($scope, socket, $location) {
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
  }])

  .controller('ShadowCtrl', ['$scope', 'socket', '$location', function($scope, socket, $location) {

  }])

  .controller('LightCtrl', ['$scope', 'socket', '$location', function($scope, socket, $location) {

  }]);
