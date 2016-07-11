window.app = angular.module('missbehua', [
  "firebase",
  "ngRoute"
]);

app.service("UtilityService", function() {

  this.processEmail = function(email) {
    return email.replace(/\./g, ",");
  }

});

app.directive("productImage", ["$timeout", "$window", function($timeout, $window){
  return {
    scope: {
      imagepath: "@"
    },
    template:`<img ng-if="imagelink" ng-src="{{imagelink}}" alt="" class="card-img-top">`,
    link: function(scope, element, attrs) {
      $timeout(function(){
        $window.firebase.storage().ref(scope.imagepath).getDownloadURL().then(function(url){
          scope.imagelink = url;
          scope.$digest();
        }, function(failed){
          console.log("Image URL failed", failed);
        });
      });
    }
  }
}]);

app.config(["$locationProvider", "$routeProvider", "$controllerProvider", "$compileProvider", function($locationProvider, $routeProvider, $controllerProvider, $compileProvider) {
  $controllerProvider.allowGlobals();
  $compileProvider.debugInfoEnabled(false);
  $locationProvider.html5Mode(true);

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
    .when("/order", {
      templateUrl: "./order/order.html",
      controller: "OrderController"
    })
    .when("/dashboard", {
      templateUrl: "./dashboard/Dashboard.html",
      controller: "DashboardController"
    })
    .otherwise({
      redirectTo: "/"
    });
}]);
