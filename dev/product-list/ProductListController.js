(function() {
  'use strict';

  app.controller("ProductListController", ["$scope", "$window", "$timeout", function($scope, $window, $timeout) {

    var productsArray = [];
    var cartContent = {};
    var firebaseStorageRef;
    var productRef, productListener;

    init();

    function init() {
      $timeout(function(){
        firebaseStorageRef = $window.firebase.storage().ref();
        productRef = $window.firebase.database().ref("products");
        productListener = function(snapshot){
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
          this.productsArray.push(productJson);
        }
      }
    }

    validateAmount(product: any) {
      console.log(product);
      if (isNaN(product.amount)) {
        product.error = true;
      } else {
        product.error = false;
      }
    }

    addToCart(product: any) {
      if (product && product.amount) {
        this.cartContent[product.name] = product.amount;
      }
    }

    isProductAddedToCart(product: any) {
      return this.cartContent.hasOwnProperty(product.name);
    }

    removeFromCart(product: any) {
      if (this.isProductAddedToCart(product)) {
        delete this.cartContent[product.name];
        product.amount = null;
      } else {
        return null;
      }
    }

    onSubmitClicked() {
      CartHelperService.setCartItems(this.cartContent);
      this.router.navigate(["/cart"]);
    }

    $scope.$on("$routeChangeStart", function(next, current){
      $timeout(function(){
        productRef.off()
      });
    })

  }]);

})();
