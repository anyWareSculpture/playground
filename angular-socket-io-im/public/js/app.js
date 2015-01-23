'use strict';

// Declare app level module which depends on filters, and services
var app = angular.module('myApp', 
	[
	'myApp.filters',
	'myApp.directives',
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

  //TODO Logout (and logout on close)

  otherwise({redirectTo: '/login'});

  $locationProvider.html5Mode(true);
}])

.run(function($rootScope, $location) {

  // register listener to watch route changes
  $rootScope.$on( "$routeChangeStart", function(event, next, current) {
    // enforce login before viewing other pages
    if ( !$rootScope.hasUser()  &&
      next.templateUrl !== "partials/login.jade") {
      $location.path( "/login" );
    }
  });
});
