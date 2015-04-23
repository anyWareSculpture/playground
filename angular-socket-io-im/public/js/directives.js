'use strict';

/* Directives */


angular.module('myApp.directives', []).
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
        elm.text(version);
    };
  }]).

  directive('sculptureState', function() {
    return {
        templateUrl: 'partials/sculptureState.jade'
    };
  }).

  directive('handshake', function() {
    function Controller($scope, $element, $attrs, socket) {
      $scope.toggleHandshake = function() {
          var sendingHandshake = $scope.user.handshake;

          // emit handshake toggle
          socket.emit('user:change', {
           "handshake": sendingHandshake
          });

          if (sendingHandshake) {
            $scope.buttonText = "Sending Handshake!";
          } else {
            $scope.buttonText = "Send handshake!";
          }
          $scope.hasHandshakeSuccess();
      };
      $scope.hasHandshakeSuccess = function() {
          var success = _.filter(this.users, function (user) {
            return user.handshake;
          });

          $scope.hasHandshake = (success.length > 1);
          return $scope.hasHandshake;
      };
    };
    // link the $scope to the DOM element and UI events.
    function link($scope, element, attributes, controllers) {
      $scope.$watch(function() { return $scope.user.handshake; }, function(newVal, oldVal) {
        if (newVal !== oldVal) {
          $scope.toggleHandshake();
        }
      });
    };
    return {
      controller: Controller,
      link: link,
      templateUrl: 'partials/handshake.jade'
    };
  });
