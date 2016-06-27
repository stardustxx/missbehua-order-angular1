(function() {
  'use strict';

  window.app = angular.module('missbehua', [
    "firebase",
    "ngRoute"
  ]);

  app.service("UtilityService", ["", function() {

    this.processEmail = function(email) {
      return email.replace(/\./g, ",");
    }

  }]);

  app.config(["$locationProvider", "$routeProvider", function($locationProvider, $routeProvider) {
    $locationProvider.hashPrefix("!");

    $routeProvider
      .when("/", {
        redirectTo: "/home"
      })
      .when("/home", {
        templateUrl: "./home/home.html",
        controller: "HomeController"
      })
      .when("/products", {
        templateUrl: "./product-list/product-list.html",
        controller: "ProductListController"
      })
      .when("/cart", {
        templateUrl: "./cart/cart.html",
        controller: "CartController"
      })
      .when("/login", {
        templateUrl: "./login-signup/login-signup.html",
        controller: "LoginSignUpController"
      })
      .otherwise({
        redirectTo: "/"
      });
  }])

})();
