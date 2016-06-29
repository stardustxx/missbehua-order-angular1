(function() {
  "use strict";

  app.controller("DashboardController", ["$scope", "$rootScope", "$timeout", "$window", function($scope, $rootScope, $timeout, $window) {
    var database, storage;
    var orderRef, productRef, userRef;
    $scope.orderArray = [];
    $scope.orderDetail = {}
    $scope.productArray = [];
    $scope.categoryArray = [];
    $scope.userArray = [];

    $scope.tabProductTitle = "Product Table";

    var selectedProductToDelete = null;

    $scope.isShowingOrderDetail = false;

    $scope.isShowingProductTable = false;
    $scope.isAddingNewProduct = false;

    $scope.isShowingUser = false;
    var selectedUserToDelete = null;

    // New Product Form
    $scope.newProduct = {
      productName: "",
      newCategory: "",
      selectedCategory: "",
      fileUpload: undefined
    };

    // User
    $scope.user = {
      newEmail: ""
    };

    init();

    function init() {
      database = $window.firebase.database();
      storage = $window.firebase.storage();

      orderRef = database.ref("order/all");
      productRef = database.ref("products");
      userRef = database.ref("users");

      getOrder();
      getProduct();
      getUser();
    }

    function getOrder() {
      $timeout(function(){
        orderRef.on("child_added", function(data) {
          addDataInOrder(data);
        });
      });
    }

    function getProduct() {
      $scope.productArray = [];
      $timeout(function() {
        productRef.on("value", function(snapshot) {
          formatProductArray(snapshot.val());
        });
      });
    }

    function getUser() {
      $timeout(function() {
        userRef.on("child_added", function(data) {
          $scope.userArray.push(data.val());
          $scope.$digest();
        });
      });
    }

    function addDataInOrder(order) {
      var date = new Date(order.val().date);
      $scope.orderArray.push({
        "email": order.val().email,
        "products": order.val().product,
        "total": order.val().total,
        "date": date
      });
      $scope.$digest();
    }

    $scope.onViewMoreClicked = function(item) {
      $scope.orderDetail["email"] = item.email;
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

    function formatProductArray(result) {
      for (var category in result) {
        $scope.categoryArray.push(category);
        if (result.hasOwnProperty(category)) {
          var productsCategory = result[category];
          for (var key in productsCategory) {
            for (var obj in productsCategory[key]) {
              var product = productsCategory[key][obj];
              product["category"] = category;
              product["key"] = key;
              $scope.productArray.push(product);
            }
          }
        }
      }
      $scope.$digest();
    }

    $scope.onBackToOrderClicked = function() {
      $scope.isShowingOrderDetail = false;
      $scope.orderDetail = {};
    }

    $scope.onProductTabClicked = function() {
      $scope.isShowingProductTable = true;
    }

    $scope.onUserTabClicked = function() {
      $scope.isShowingUser = true;
    }

    $scope.onBackInProductClicked = function() {
      $scope.isAddingNewProduct = false;
      $scope.tabProductTitle = "Product Table";
    }

    $scope.onAddNewProductClicked = function() {
      $scope.isAddingNewProduct = true;
      $scope.tabProductTitle = "新增產品"
    }

    $scope.onToggleEnabledClicked = function(item) {
      item.enabled = !item.enabled;
      var obj = {
        "enabled": item.enabled,
        "image": item.image,
        "name": item.name
      };
      productRef.child(item.category).child(item.key).child(item.name).set(obj);
    }

    $scope.onDeleteProductClicked = function(item) {
      selectedProductToDelete = item;
    }

    $scope.confirmDeleteProduct = function() {
      if (selectedProductToDelete) {
        firebase.database().ref("products").child(selectedProductToDelete.category).child(selectedProductToDelete.key).set(null);
        getProduct();
      }
    }

    $scope.resetNewCategory = function() {
      $scope.newProduct.newCategory = "";
    }

    $scope.onSubmitNewProductClicked = function() {
      $timeout(function() {
        // Check File
        var file = document.getElementById("inputImageFile").files[0];
        var category;
        if (file) {
          var fileRef;
          if ($scope.newProduct.newCategory) {
            fileRef = storage.ref().child("products").child($scope.newProduct.newCategory + "/" + file.name);
            category = $scope.newProduct.newCategory;
          } else if ($scope.newProduct.selectedCategory) {
            fileRef = storage.ref().child("products").child($scope.newProduct.selectedCategory + "/" + file.name);
            category = $scope.newProduct.selectedCategory;
          } else {
            return;
          }

          $scope.newProduct.fileUpload = fileRef.put(file);

          $scope.newProduct.fileUpload.on("state_changed", function(snapshot) {
            console.log("upload success");
          }, function(error) {
            console.log(error);
          }, function() {
            var imageUrl = $scope.newProduct.fileUpload.snapshot.downloadURL;
            var obj = {
              "name": $scope.newProduct.productName,
              "image": imageUrl,
              "enabled": true
            };
            productRef.child(category).push().child($scope.newProduct.productName).set(obj);
            $scope.newProduct.productName = "";
          });
        }
      });
    }

    $scope.onAddingEmailClicked = function() {
      $timeout(function() {
        if ($scope.user.newEmail) {
          var processedEmail = UtilityService.processEmail($scope.user.newEmail);
          userRef.child(processedEmail).on("value", (snapshot) => {
            console.log("snap", snapshot.val());
            if (snapshot.val() == null) {
              firebase.database().ref("users/" + processedEmail).set({
                "account_type": 2,
                "email": $scope.user.newEmail,
                "enabled": true
              });
              $scope.user.newEmail = "";
            }
          });
        }
      });
    }

    $scope.onDeleteUserClicked = function(user) {
      selectedUserToDelete = user;
    }

    $scope.onConfirmDeleteUser = function() {
      var processedEmail = UtilityService.processEmail(selectedUserToDelete.email);
      $timeout(function() {
        userRef.child(processedEmail).set(null);
        getUser();
      });
    }

  }]);
})()
