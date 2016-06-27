(function() {
  "use strict";

  app.controller("LoginSignUpController", ["$scope", "$rootScope", "$timeout", "$location", function($scope, $rootScope, $timeout, $location) {
    $scope.userInfo = {
      "email": "",
      "password": ""
    };

    var errorString = "";

    $scope.login = function() {
      $timeout(function(){
        $window.firebase.auth().signInWithEmailAndPassword($scope.userInfo.email, $scope.userInfo.password).catch((error) => {
          if (error.code == "auth/user-not-found") {
            $scope.signup();
          } else {
            errorString = error.message;
          }
        });
      });
    }

    $scope.signup = function() {
      $timeout(function(){
        errorString = null;
        $window.firebase.auth().createUserWithEmailAndPassword($scope.userInfo.email, $scope.userInfo.password).catch((error) => {
          errorString = error.message;
        });
      });
    }
  }]);
})();
