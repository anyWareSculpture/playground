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
  });
