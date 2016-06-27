(function() {
  "use strict";

  app.controller("DashboardController", ["$scope", "$rootScope", "$timeout", "$window", function($scope, $rootScope, $timeout, $window) {
    database: any;
    storage: any;
    orderRef: any;
    productRef: any;
    userRef: any;
    orderArray: Array < any > = [];
    orderDetail: any = {}
    productArray: Array < any > = [];
    categoryArray: Array < string > = [];
    userArray: Array < any > = [];

    tabProductTitle: string = "Product Table";

    selectedProductToDelete: any = null;

    isShowingOrderDetail: boolean = false;

    isShowingProductTable: boolean = false;
    isAddingNewProduct: boolean = false;

    isShowingUser: boolean = false;
    selectedUserToDelete: any = null;

    // New Product Form
    $scope.newProduct = {
      productName: "";
      newCategory: "";
      selectedCategory: "";
      fileUpload: undefined;
    };

    // User
    $scope.user = {
      newEmail: "";
    };

    constructor() {
      this.database = firebase.database();
      this.storage = firebase.storage();
    }

    ngOnInit() {
      this.orderRef = this.database.ref("order/all");
      this.productRef = this.database.ref("products");
      this.userRef = this.database.ref("users");
    }

    ngAfterViewInit() {
      this.getOrder();
      this.getProduct();
      this.getUser();
    }

    getOrder() {
      this.orderRef.on("child_added", (data) => {
        this.addDataInOrder(data);
      });
    }

    getProduct() {
      this.productArray = [];
      this.productRef.on("value", (snapshot) => {
        this.formatProductArray(snapshot.val());
      });
    }

    getUser() {
      this.userRef.on("child_added", (data) => {
        this.userArray.push(data.val());
      });
    }

    addDataInOrder(order: any) {
      var date = new Date(order.val().date);
      this.orderArray.push({
        "email": order.val().email,
        "products": order.val().product,
        "total": order.val().total,
        "date": date
      });
    }

    onViewMoreClicked(item: any) {
      this.orderDetail["email"] = item.email;
      this.orderDetail["products"] = [];
      this.orderDetail["total"] = item.total;
      this.orderDetail["date"] = item.date;
      var products = item.products;
      for (var prop in products) {
        if (products.hasOwnProperty(prop)) {
          this.orderDetail["products"].push({
            "name": prop,
            "amount": products[prop]
          });
        }
      }
      this.isShowingOrderDetail = true;
    }

    formatProductArray(result: any) {
      for (var category in result) {
        this.categoryArray.push(category);
        if (result.hasOwnProperty(category)) {
          var productsCategory = result[category];
          for (var key in productsCategory) {
            for (var obj in productsCategory[key]) {
              var product = productsCategory[key][obj];
              product["category"] = category;
              product["key"] = key;
              this.productArray.push(product);
            }
          }
        }
      }
    }

    onBackToOrderClicked() {
      this.isShowingOrderDetail = false;
      this.orderDetail = {};
    }

    onProductTabClicked() {
      this.isShowingProductTable = true;
    }

    onUserTabClicked() {
      this.isShowingUser = true;
    }

    onBackInProductClicked() {
      this.isAddingNewProduct = false;
      this.tabProductTitle = "Product Table";
    }

    onAddNewProductClicked() {
      this.isAddingNewProduct = true;
      this.tabProductTitle = "新增產品"
    }

    onToggleEnabledClicked(item: any) {
      item.enabled = !item.enabled;
      var obj = {
        "enabled": item.enabled,
        "image": item.image,
        "name": item.name
      };
      this.productRef.child(item.category).child(item.key).child(item.name).set(obj);
    }

    onDeleteProductClicked(item: any) {
      this.selectedProductToDelete = item;
    }

    confirmDeleteProduct() {
      if (this.selectedProductToDelete) {
        firebase.database().ref("products").child(this.selectedProductToDelete.category).child(this.selectedProductToDelete.key).set(null);
        this.getProduct();
      }
    }

    resetNewCategory() {
      this.newCategory = "";
    }

    onSubmitNewProductClicked() {
      // Check File
      var file = ( < HTMLInputElement > document.getElementById("inputImageFile")).files[0];
      var category;
      if (file) {
        var fileRef;
        if (this.newCategory) {
          fileRef = this.storage.ref().child("products").child(this.newCategory + "/" + file.name);
          category = this.newCategory;
        } else if (this.selectedCategory) {
          fileRef = this.storage.ref().child("products").child(this.selectedCategory + "/" + file.name);
          category = this.selectedCategory;
        } else {
          return;
        }

        this.fileUpload = fileRef.put(file);

        this.fileUpload.on("state_changed", (snapshot) => {

        }, (error) => {
          console.log(error);
        }, () => {
          var imageUrl = this.fileUpload.snapshot.downloadURL;
          var obj = {
            "name": this.productName,
            "image": imageUrl,
            "enabled": true
          };
          this.productRef.child(category).push().child(this.productName).set(obj);
          this.productName = "";
        });
      }
    }

    onAddingEmailClicked() {
      if (this.newEmail) {
        var processedEmail = UtilityService.processEmail(this.newEmail);
        this.userRef.child(processedEmail).on("value", (snapshot) => {
          console.log("snap", snapshot.val());
          if (snapshot.val() == null) {
            firebase.database().ref("users/" + processedEmail).set({
              "account_type": 2,
              "email": this.newEmail,
              "enabled": true
            });
            this.newEmail = "";
          }
        });
      }
    }

    onDeleteUserClicked(user: any) {
      this.selectedUserToDelete = user;
    }

    onConfirmDeleteUser() {
      var processedEmail = UtilityService.processEmail(this.selectedUserToDelete.email);
      this.userRef.child(processedEmail).set(null);
      this.getUser();
    }

  }]);
})()
