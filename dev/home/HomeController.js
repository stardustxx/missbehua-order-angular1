app.controller("HomeController", ["$scope", "$rootScope", "$location", function($scope, $rootScope, $location) {
  $scope.onProductButtonClicked = function() {
    $location.path("/products");
  }

  $scope.onOrderButtonClicked = function() {
    $location.path("/dashboard");
  }
}]);
