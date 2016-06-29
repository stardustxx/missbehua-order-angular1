(function() {
  'use strict';

  app.controller("MainController", ["$scope", "$rootScope", "$firebaseAuth", "UtilityService", "$timeout", "$location", function($scope, $rootScope, $firebaseAuth, UtilityService, $timeout, $location) {
    var firebaseAuth = $firebaseAuth();

    $scope.isLoggedIn = false;

    $timeout(function(){
      firebaseAuth.$onAuthStateChanged(function(user) {
        if (user) {
          validateUser(user);
        } else {
          $location.path("/login");
          $scope.isLoggedIn = false;
        }
      });
    });

    function validateUser(user) {
      var processedEmail = UtilityService.processEmail(user.email);
      firebase.database().ref("users").child(processedEmail).on("value", function(snapshot) {
        $timeout(function() {
          if (snapshot.val() != null) {
            if ($location.path() == "/login") {
              $location.path("/home");
            }
            $scope.isLoggedIn = true;
          } else {
            $scope.signOut();
          }
        })
      });
    }

    $scope.signOut = function() {
      firebaseAuth.$signOut();
    }
  }]);

}());
