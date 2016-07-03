app.controller("ProductListController", ["$scope", "$rootScope", "$window", "$timeout", "$location", function($scope, $rootScope, $window, $timeout, $location) {

  $scope.productsArray = [];
  $rootScope.cartItems = {};
  var firebaseStorageRef;
  var productRef, productListener;

  init();

  function init() {
    $timeout(function() {
      firebaseStorageRef = $window.firebase.storage().ref();
      productRef = $window.firebase.database().ref("products");
      productListener = function(snapshot) {
        formatProducts(snapshot.val());
      }
      productRef.on('value', productListener);
    });
  }

  function formatProducts(productObj) {
    for (var prop in productObj) {
      if (productObj.hasOwnProperty(prop)) {
        var productJson = {};
        // Category name
        productJson["name"] = prop;
        productJson["products"] = [];
        // Product Key
        for (var productKey in productObj[prop]) {
          if (productObj[prop].hasOwnProperty(productKey)) {
            // The actual product data
            for (var productProp in productObj[prop][productKey]) {
              if (productObj[prop][productKey].hasOwnProperty(productProp)) {
                var product = productObj[prop][productKey][productProp];
                var singleProduct = {
                  "name": "",
                  "amount": null,
                  "link": "",
                  "error": false
                };
                singleProduct.name = product.name;
                singleProduct.link = product.image;
                productJson.products.push(singleProduct);
              }
            }
          }
        }
        $scope.productsArray.push(productJson);
      }
      $scope.$digest();
    }
  }

  function validateAmount(product) {
    if (isNaN(product.amount)) {
      product.error = true;
    } else {
      product.error = false;
    }
  }

  $scope.addToCart = function(product) {
    if (product && product.amount) {
      $rootScope.cartItems[product.name] = product.amount;
    }
  }

  $scope.isProductAddedToCart = function(product) {
    return $rootScope.cartItems.hasOwnProperty(product.name);
  }

  $scope.removeFromCart = function(product) {
    if ($scope.isProductAddedToCart(product)) {
      delete $rootScope.cartItems[product.name];
      product.amount = null;
    } else {
      return null;
    }
  }

  $scope.onSubmitClicked = function() {
    $location.path("/cart");
  }

  $scope.$on("$routeChangeStart", function(next, current) {
    $timeout(function() {
      productRef.off()
    });
  })

}]);
