'use strict';

/* Controllers */

angular.module('myApp.controllers', [])

  .controller(
    'AppCtrl', 
    ['$scope', 'socket', '$location', '$rootScope', '$document', '$timeout', '_',
    function ($scope, socket, $location, $rootScope, $document, $timeout, _) {
      // Init
      //=================

      $rootScope.user = {
        name: '',
        proximity: 0,
        handshake: false,
        color: ''
      };
      $rootScope.messages = [];

      // Socket listeners
      // ================

      socket.on('init', function (data) {
        $rootScope.users = data || {};
      });

      socket.on('send:message', function (message) {
        $rootScope.messages.push(message);
      });

      socket.on('user:login', function (data) { 
        $rootScope.messages.push({ 
          user: 'chatroom',
          text: 'User ' + data.name + ' has joined.'
        });
        $rootScope.users[data.name] = data;
      });

      socket.on('user:change', function (data) {
        _.extend($scope.users[data.name], data);
      });

      socket.on('state:change'), function (data) {
        $scope.continue(data);
      }

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
      $rootScope.continue = function (options) {
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
        }

        $location.url(newUrl);
      };

      $rootScope.hasUser = function() {
        return $scope.user.name !== '';
      };

      $rootScope.$watchCollection(
        function() {
          return $rootScope.messages;
        },
        function(newVal, oldVal) {
          var msgs = document.getElementById('messages');
          if (msgs) {
            $timeout(function () { msgs.scrollTop = msgs.scrollHeight  }, 0, false);
          }
        }
      );
    }
 ])

  .controller('LoginCtrl', ['$scope', 'socket', '$location', '$routeParams', function($scope, socket, $location, $routeParams) {
    $scope.login = function() {
      if ($routeParams.url && 
          $routeParams.url !== '/login' &&
          $routeParams.url !== '/approach'
      ) {
        $scope.user.proximity = 1;
      }
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
