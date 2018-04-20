 var fieldService = angular.module('starter.services', []);
 fieldService.service('FrmListService', function($http, $q, $window, BASE_URL) {
     this.getFormLists = function() {
         return $http.get(BASE_URL + '/api/getForms?userId=' + $window.localStorage.user);
     };
     this.getForm = function() {
         return $http.get(BASE_URL + '/api/getForms?userId=' + $window.localStorage.user);
     };
     this.getArchiveData = function(frm) {
         return $http.get(BASE_URL + '/api/getArchiveData?user=' + $window.localStorage.user + '&form=' + frm);
     };
     var selectedForm;
     this.setForm = function(fm) {
         selectedForm = fm;
         console.log(selectedForm, ";;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;");
     };
     this.getFormById = function(id) {
         return selectedForm.filter(function(m) {
             console.log(m.formId, id);
             if (m.formId === parseInt(id, 10)) return true;
             return false;
         })[0];
     };
     var subData = [];
      this.resetSubData = function(o) {
        subData = [];

     }
      this.getSubData = function(o) {
        return subData;
        
     }
     this.updateSubData = function(entry) {
        subData.push(entry);
     }
     this.submitForm = function(frm) {
         console.log(frm);
         return $http({
             method: "post",
             url: BASE_URL + "/post/saveFormData",
             data: frm
         });
     };
 });
 fieldService.service('Auth', function($window, $http, $q, $ionicHistory, BASE_URL) {
     this.login = function(u, p) {
         return $http({
             method: "post",
             url: BASE_URL + "/post/authUser",
             data: {
                 "user": u,
                 "password": p
             }
         });
     };
     this.logout = function() {
         var dfd = $q.defer();
         var pData = $window.localStorage.pendingData;
         $window.localStorage.clear();
         $window.localStorage.pendingData = pData;
         $ionicHistory.clearCache();
         $ionicHistory.clearHistory();
         dfd.resolve(true);
         return dfd.promise;
     };
     this.isAuth = function() {
         return $window.localStorage.user || false;
     };
     this.getUser = function() {
         return $window.localStorage.user;
     };
     this.getUserName = function() {
         return $window.localStorage.username;
     };
 });
 fieldService.service('GeoService', ['$q', '$cordovaGeolocation',
     function($q, $cordovaGeolocation) {
         this.getCurrentPosition = function() {
             var dfd = $q.defer();
             var posOptions = {
                 timeout: 10000,
                 enableHighAccuracy: true
             };
             $cordovaGeolocation.getCurrentPosition(posOptions).then(function(position) {
                 console.dir(position);
                 var lat = position.coords.latitude;
                 var long = position.coords.longitude;
                 console.log('lat long ' + lat + ',' + long);
                 dfd.resolve(position.coords);
             }, function(err) {
                 // error
                 /* if (err.code === 2) {
                      dfd.resolve();
                  } else {*/
                 dfd.reject(err);
                 //  }
             });
             return dfd.promise;
         };
     }
 ]);