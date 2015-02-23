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
    function Controller($scope, $element, $attrs) {
      $scope.toggleHandshake = function() {
          var sendingHandshake = this.user.handshake,
              newState = !sendingHandshake;
          // emit handshake event,

          // update user state,
          var username = this.user.name;
          this.user.handshake = newState;
          this.users[username].handshake = newState;

          if (newState) {
            $scope.buttonText = "Revoke handshake!";
          } else {
            $scope.buttonText = "Send handshake!";
          }

          console.log('toggleHandshake');
          console.log($scope.user.handshake);
      };
    };
    // link the $scope to the DOM element and UI events.
    function link($scope, element, attributes, controllers) {

    };
    return {
      controller: Controller,
      link: link,
      templateUrl: 'partials/handshake.jade'
    };
  });
