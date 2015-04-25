'use strict';

var underscore = angular.module('underscore', []);
underscore.factory('_', function() {
  return window._;
});

// Declare app level module which depends on filters, and services
var app = angular.module('myApp', 
  [
  'underscore',
  'ngRoute',
  'ngMaterial',
  'myApp.filters',
  'myApp.directives',
  'myApp.controllers'
  ])

.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
  $routeProvider.
  when('/login', {
    templateUrl: 'partials/login.jade',
    controller: 'LoginCtrl'
  }).

  when('/approach', {
    templateUrl: 'partials/approach.jade',
    controller: 'ApproachCtrl'
  }).

  when('/closed', {
  	templateUrl: 'partials/closed.jade',
  	controller: 'ClosedCtrl'
  }).

  when('/shadow', {
  	templateUrl: 'partials/shadow.jade',
  	controller: 'ShadowCtrl'
  }).

  when('/light', {
  	templateUrl: 'partials/light.jade',
  	controller: 'LightCtrl'
  }).

  otherwise({redirectTo: '/login'});

  $locationProvider.html5Mode(true);
}])

.run(function($rootScope, $location) {

  // register listener to watch route changes
  $rootScope.$on( "$routeChangeStart", function(event, next, current) {
    // enforce login before viewing other pages
    if ( !$rootScope.hasUser()  &&
      $location.path() !== '/login' &&
      $location.path() !== '/') {
        var qs = $location.search();
        if($location.hasOwnProperty('name')) {
          // if query string has a name, autologin and set proximity
          // then continue to originally requested page
          $rootScope.login($location.search('name'));
          $rootScope.approach();
        } else {
          // if no login name in query string, redirect to login
          // with intended path as the query string
          $location.search('url', $location.path());
          $location.path('/login');
        }
    }
  });
});
