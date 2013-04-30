'use strict';

var app = angular.module('testApp', ['angularPicasa','directive.g+signin']);

//
// Callback for Google+ Sign-In
//
function signinCallback(authResult) {
  console.log( authResult);
  if (authResult['access_token']) {
    console.log("cool! the user successfully authorized our demo app");
  } else if (authResult['error']) {
    // User has not authorized our amazing app - No comments for you!
    console.log("error");
  }
} 