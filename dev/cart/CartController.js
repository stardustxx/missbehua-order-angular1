(function() {
  "use strict";

  app.controller("CartController", ["$scope", "$rootScope", "$timeout", "$location", "$window", function($scope, $rootScope, $timeout, $location, $window) {
    $rootScope.cartItems = [];
    $scope.cartItemsArray = [];
    $scope.itemTotal = 0;
    var currentUser = {};

    init();

    function init() {
      $timeout(function(){
        currentUser = $window.firebase.auth().currentUser;
      });
    }

    ngAfterViewInit() {
      for (var prop in $rootScope.cartItems) {
        if ($rootScope.cartItems.hasOwnProperty(prop)) {
          var item = {
            "name": prop,
            "amount": $rootScope.cartItems[prop]
          };
          $scope.cartItemsArray.push(item);
          $scope.itemTotal += parseInt(item.amount);
        }
      }
      $scope.cartItemsArray.push({
        "name": "總數",
        "amount": $scope.itemTotal
      });
    }

    onSubmitOrderClicked() {
      $timeout(function(){
        var processedEmail = UtilityService.processEmail(currentUser.email);
        var newKey = $window.firebase.database().ref("order/admin").push().key;

        var date = new Date();

        var clientOrder = {
          "product": $rootScope.cartItems,
          "total": $scope.itemTotal,
          "date": date.getTime()
        };

        $window.firebase.database().ref("order").child("admin").child(processedEmail).child(newKey).set(clientOrder);
        $window.firebase.database().ref("order").child(processedEmail).child(newKey).set(clientOrder);
        clientOrder["email"] = currentUser.email;
        $window.firebase.database().ref("order/all").child(newKey).set(clientOrder);

        $location.path("/products");
      });
    }
  }]);
})();
