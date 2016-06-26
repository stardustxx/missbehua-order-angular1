(function() {
  'use strict';

  window.app = angular.module('missbehua', [
    "firebase"
  ]);

  app.service("UtilityService",["", function() {

    this.processEmail = function(email) {
      return email.replace(/\./g, ",");
    }

  }]);

})();
