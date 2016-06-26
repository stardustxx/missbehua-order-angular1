(function() {
  'use strict';

  app.controller("MainController", ["$scope", "$rootScope", "$firebaseAuth", "UtilityService", "$timeout", function($scope, $rootScope, $firebaseAuth, UtilityService, $timeout) {
    var firebaseAuth = $firebaseAuth();

    $scope.isLoggedIn = false;

    firebaseAuth.$onAuthStateChanged(function(user) {
      if (user) {
        validateUser(user);
      } else {
        // route to login page
        $scope.isLoggedIn = false;
      }
    });

    function validateUser(user) {
      var processedEmail = UtilityService.processEmail(user.email);
      firebase.database().ref("users").child(processedEmail).on("value", function(snapshot) {
        $timeout(function() {
          if (snapshot.val() != null) {
            // this.router.navigate(["/home"]);
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
