app.controller("OrderController", ["$scope", "$rootScope", "$timeout", "$window", "UtilityService", function($scope, $rootScope, $timeout, $window, UtilityService) {
  $scope.isShowingOrderDetail = false;
  $scope.orderArray = [];
  $scope.orderDetail = {}
  var orderRef;

  init();

  function init() {
    var processedEmail = UtilityService.processEmail($rootScope.currentUser.email);
    orderRef = $window.firebase.database().ref("order").child(processedEmail);

    getOrder();
  }

  function getOrder() {
    $timeout(function() {
      orderRef.on("child_added", function(data) {
        addDataInOrder(data);
      });
    });
  }

  function addDataInOrder(order) {
    var date = new Date(order.val().date);
    $scope.orderArray.push({
      "products": order.val().product,
      "total": order.val().total,
      "date": date
    });
    $scope.$digest();
  }

  $scope.onViewMoreClicked = function(item) {
    $scope.orderDetail["products"] = [];
    $scope.orderDetail["total"] = item.total;
    $scope.orderDetail["date"] = item.date;
    var products = item.products;
    for (var prop in products) {
      if (products.hasOwnProperty(prop)) {
        $scope.orderDetail["products"].push({
          "name": prop,
          "amount": products[prop]
        });
      }
    }
    $scope.isShowingOrderDetail = true;
  }

  $scope.onBackToOrderClicked = function() {
    $scope.isShowingOrderDetail = false;
    $scope.orderDetail = {};
  }

  $rootScope.$watch("currentUser", function(current, previous) {
    if (current != previous && current) {
      init();
    }
  });
}]);
