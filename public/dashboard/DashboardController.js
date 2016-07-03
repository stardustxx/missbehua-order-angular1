app.controller("DashboardController", ["$scope", "$rootScope", "$timeout", "$window", "UtilityService", function($scope, $rootScope, $timeout, $window, UtilityService) {
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

  $scope.isAddingNewProduct = false;

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

    $timeout(function() {
      $(".nav-item a[href='#order']").click(function(event) {
        event.preventDefault();
        $(".nav-item a[href='#order']").tab("show");
      });
      $(".nav-item a[href='#product']").click(function(event) {
        event.preventDefault();
        $(".nav-item a[href='#product']").tab("show");
      });
      $(".nav-item a[href='#user']").click(function(event) {
        event.preventDefault();
        $(".nav-item a[href='#user']").tab("show");
      });
    });
  }

  function getOrder() {
    $timeout(function() {
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
      $scope.userArray = [];
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
    $scope.categoryArray = [];
    for (var category in result) {
      var categoryObj = {};
      categoryObj.name = category;
      $scope.categoryArray.push(categoryObj);
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
    $timeout(function() {
      productRef.child(item.category).child(item.key).child(item.name).set(obj);
    });
  }

  $scope.onDeleteProductClicked = function(item) {
    selectedProductToDelete = item;
  }

  $scope.confirmDeleteProduct = function() {
    if (selectedProductToDelete) {
      $timeout(function() {
        firebase.database().ref("products").child(selectedProductToDelete.category).child(selectedProductToDelete.key).set(null);
        selectedProductToDelete = null;
        getProduct();
      });
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
          fileRef = storage.ref().child("products").child($scope.newProduct.selectedCategory.name + "/" + file.name);
          category = $scope.newProduct.selectedCategory.name;
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
        userRef.child(processedEmail).on("value", function(snapshot) {
          if (snapshot.val() == null) {
            userRef.child(processedEmail).set({
              "account_type": 2,
              "email": $scope.user.newEmail,
              "enabled": true
            });
            $scope.user.newEmail = "";
          }
          userRef.child(processedEmail).off();
        });
      }
    });
  }

  $scope.onDeleteUserClicked = function(user) {
    if (user != null && user != undefined) {
      selectedUserToDelete = {};
      for (var prop in user) {
        if (user.hasOwnProperty(prop)) {
          selectedUserToDelete[prop] = user[prop];
        }
      }
    }
  }

  $scope.onConfirmDeleteUser = function() {
    if (selectedUserToDelete) {
      $timeout(function() {
        var processedEmail = UtilityService.processEmail(selectedUserToDelete.email);
        userRef.child(processedEmail).remove();
        selectedUserToDelete = null;
        getUser();
      });
    }
  }

}]);
