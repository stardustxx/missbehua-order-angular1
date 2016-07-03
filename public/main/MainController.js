app.controller("MainController", ["$scope", "$rootScope", "$firebaseAuth", "UtilityService", "$timeout", "$location", "$window", function($scope, $rootScope, $firebaseAuth, UtilityService, $timeout, $location, $window) {
  var firebaseAuth = $firebaseAuth();

  $scope.isLoggedIn = false;
  $rootScope.currentUser = null;
  var userIsChecked = false;

  $timeout(function() {
    firebaseAuth.$onAuthStateChanged(function(user) {
      if (user) {
        validateUser(user);
      } else {
        $location.path("/login");
        $scope.isLoggedIn = false;
      }
      userIsChecked = true;
    });
  });

  function validateUser(user) {
    var processedEmail = UtilityService.processEmail(user.email);
    $window.firebase.database().ref("users").child(processedEmail).on("value", function(snapshot) {
      $timeout(function() {
        if (snapshot.val() != null) {
          if ($location.path() == "/login") {
            $location.path("/home");
          }
          $scope.isLoggedIn = true;
          $rootScope.currentUser = snapshot.val();
        } else {
          $scope.signOut();
        }
      })
    });
  }

  $scope.signOut = function() {
    firebaseAuth.$signOut();
  }

  $scope.$on("$routeChangeStart", function(event, next, current) {
    if (userIsChecked) {
      if (!$rootScope.currentUser) {
        $location.path("/login");
      }
    }
  });
}]);
