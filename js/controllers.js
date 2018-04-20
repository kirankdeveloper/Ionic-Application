angular.module('starter.controllers', []).controller('AppCtrl', function($scope, $state, Auth, GeoService, $ionicPopup, $ionicHistory, $cordovaCamera, $timeout, BASE_URL) {
    $scope.logout = function() {
        console.log('logoutttttttttttttttttttttt.............');
        // A confirm dialog
        $ionicPopup.confirm({
            title: 'IonicSample',
            template: 'Are you sure you want to logout!!!'
        }).then(function(res) {
            if (res) {
                $ionicHistory.nextViewOptions({
                    disableAnimate: true,
                    disableBack: true
                });
                Auth.logout().then(function() {
                    $state.go('signin');
                });
            } else {
                //$ionicHistory.goBack(-1);
            }
        });
    };

    function eGps(e) {}

    function gpsCheck() {
        try {
            cordova.plugins.locationAccuracy.request(function(m) {}, eGps, cordova.plugins.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY);
        } catch (e) {
            $ionicPopup.alert({
                title: 'GPS!',
                content: "fail !" + e
            });
        }
    }
    $timeout(function() {
        gpsCheck();
    }, 5000);
}).controller('SignInCtrl', function(BASE_URL, $scope, $state, $timeout, $ionicLoading, Auth, $ionicPopup, $window, $ionicHistory, $cordovaNetwork, $rootScope, $ionicPlatform, $cordovaCamera) {
    $scope.user = {
        'username': '',
        'password': ''
    };
    $scope.signIn = function(user) {
        if ($scope.user.username === '' || $scope.user.password === '') {
            $ionicPopup.alert({
                title: 'Error',
                content: 'Enter email and password'
            });
        } else {
            // Setup the loader
            $ionicLoading.show({
                content: 'Loading',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0
            });
            $timeout(function() {
                Auth.login(user.username, user.password).then(function(res) {
                    console.log(res);
                    $ionicLoading.hide();
                    if (res.data.status) {
                        $window.localStorage.user = res.data.userId;
                        $window.localStorage.username = res.data.userName;
                        $ionicHistory.nextViewOptions({
                            disableAnimate: true,
                            disableBack: true
                        });
                        $state.go('app.formlists');
                        //console.log(res.data);
                    } else {
                        console.log('login falised');
                        $ionicPopup.alert({
                            title: 'Error',
                            content: 'email or password is wrong'
                        });
                    }
                }, function(e) {
                    $ionicLoading.hide();
                    if (e.status === 0) {
                        $ionicPopup.alert({
                            title: 'No internet',
                            content: 'Check you network connection and try again.'
                        });
                    } else {
                        $ionicPopup.alert({
                            title: 'Error',
                            content: 'email or password is wrong'
                        });
                    }
                });
            }, 1000);
        }
    };
}).controller('FormlistsCtrl', function($scope, $ionicLoading, FrmListService, $cordovaCamera, $ionicPopup, $window, BASE_URL) {
    $scope.sync = function() {
        $ionicLoading.show();
        $scope.bUrl = BASE_URL;
        try {
            var t = JSON.parse($window.localStorage.pendingData);
            FrmListService.submitForm(t).then(function(res) {
                if (res.statusText == "OK") {
                    $window.localStorage.pendingData = "";
                }
            });
        } catch (e) {
            console.log(e);
        }
        FrmListService.getForm().then(function(res) {
            console.log(res);
            $ionicLoading.hide();
            $scope.formlists = res.data;
            FrmListService.setForm(res.data);
        }, function(res) {
            $ionicLoading.hide();
            if (res.status === 0) {
                $ionicPopup.alert({
                    title: 'No internet',
                    content: 'Check you network connection and try again.'
                });
            } else {
                $ionicPopup.alert({
                    title: 'Error',
                    content: res.message
                });
            }
        });
    };
    $scope.sync();
}).controller('FormlistCtrl', function($scope, $state, $stateParams, $ionicPopup, $timeout, $ionicLoading, FrmListService, $filter, Auth, $ionicModal, GeoService, $cordovaCamera, $window, $ionicPlatform, BASE_URL) {
    var vm = this;
    vm.user = {};
    vm.onSubmit = submitForm;
    vm.bUrl = BASE_URL;
    $ionicModal.fromTemplateUrl('templates/signature.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.modal = modal;
    });
    vm.userForm = FrmListService.getFormById($stateParams.formlistId);
    vm.formName = vm.userForm.name;
    vm.icon = vm.userForm.icon;
    console.log(vm.userForm.name);
    vm.userFields = vm.userForm.fields;
    console.log(vm.userFields);

    function submitForm() {
        if (!vm.form.$valid || (vm.form.customErrors && Object.keys(vm.form.customErrors).length)) {
            console.error("invalid");
            $ionicPopup.alert({
                title: 'Form Error',
                content: 'Please check input entries'
            });
            return false;
        }
        console.log("valid");
        console.log(vm.user);
        $ionicLoading.show({
            content: 'Loading',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });
        var frm = {};
        frm.formId = vm.userForm.formId;
        frm.formName = vm.userForm.name;
        frm.userId = Auth.getUser();
        frm.userName = Auth.getUserName();
        var l = Object.keys(vm.user);
        l.forEach(function(m) {
            if (vm.user[m] && vm.user[m].value) {
                vm.user[m] = vm.user[m].value;
            }
            if (vm.user[m] === null) {
                delete vm.user[m];
            }
        });
        frm.data = vm.user;
        if (vm.userForm.subFormId) {
            frm.subFormData = FrmListService.getSubData();
            console.log(frm.subFormData);
        }
        console.log("herer");
        cordova.plugins.locationAccuracy.request(function(m) {
            GeoService.getCurrentPosition().then(submitFormWithGPS, GPSError);
        }, GPSError2, cordova.plugins.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY);

        function submitFormWithGPS(coords) {
            frm.position = {
                "longitude": coords.longitude,
                "latitude": coords.latitude
            };
            frm.when = +new Date();
            FrmListService.submitForm(frm).then(function(res) {
                $ionicLoading.hide();
                if (res.statusText == "OK") {
                    $ionicPopup.alert({
                        title: 'Success',
                        content: vm.userForm.name + ' form submitted'
                    }).then(function(res) {
                        $state.go('app.formlists');
                    });
                } else {
                    $ionicPopup.alert({
                        title: 'Error',
                        content: vm.userForm.name + ' form not submitted '
                    }).then(function(res) {
                        $state.go('app.formlists');
                    });
                }
            }, function(e) {
                $ionicLoading.hide();
                if (e.status === 0) {
                    $window.localStorage.pendingData = JSON.stringify(frm);
                    console.log($window.localStorage.pendingData);
                    $ionicPopup.alert({
                        title: 'No internet',
                        content: 'Data is saved and will be uploaded later'
                    }).then(function(res) {
                        $state.go('app.formlists');
                    });
                } else {
                    $ionicPopup.alert({
                        title: 'Error',
                        content: e.message
                    });
                }
            });
        }

        function GPSError(e) {
            submitFormWithGPS({});
        }

        function GPSError2(e) {
            submitFormWithGPS({});
        }
    }
}).controller('optionsCtrl', function($scope, $state, $stateParams) {
    var vm = this;
    vm.formId = $stateParams.formlistId;
    vm.newSubmit = function() {
        $state.go('app.single', {
            'formlistId': vm.formId
        });
    };
    vm.archive = function() {
        $state.go('app.archiveList', {
            'formlistId': vm.formId
        });
    };
    //    $scope.sync();
}).controller('archiveListCtrl', function($scope, $state, $stateParams, BASE_URL, $ionicLoading, FrmListService, $ionicPopup) {
    var vm = this;
    vm.formId = $stateParams.formlistId;
    vm.bUrl = BASE_URL;
    vm.getDate = function(d) {
        return new Date(parseInt(d, 10) + 19800000).toGMTString().replace('GMT', 'IST');
    }
    vm.sync = function() {
        $ionicLoading.show();
        FrmListService.getArchiveData(vm.formId).then(function(res) {
            console.log(res);
            $ionicLoading.hide();
            vm.archiveList = res.data;
            //FrmListService.setForm(res.data);
        }, function(res) {
            $ionicLoading.hide();
            if (res.status === 0) {
                $ionicPopup.alert({
                    title: 'No internet',
                    content: 'Check you network connection and try again.'
                });
            } else {
                $ionicPopup.alert({
                    title: 'Error',
                    content: res
                });
            }
        });
    };
    vm.sync();
}).controller('archiveCtrl', function($scope, $state, $stateParams, FrmListService, $ionicPopup) {
    var vm = this;
    try {
        vm.fields = FrmListService.getFormById($stateParams.formId).fields;
        vm.data = $stateParams.item.data;
    } catch (e) {
        $ionicPopup.alert({
            title: 'Error' + $stateParams.item,
            content: e
        });
    }
}).controller('subFormCtrl', function($scope, $state, $stateParams, FrmListService, $ionicPopup, $ionicLoading) {
    var vm = this;
    vm.onSubmit = onSubmit;
    FrmListService.resetSubData();

    function onSubmit() {
        $ionicLoading.show();
        FrmListService.updateSubData(vm.data);
        vm.data = {};
        vm.count = FrmListService.getSubData().length;
        setTimeout(function() {
            $ionicLoading.hide();
        }, 1000);
    }
    try {
        vm.form = FrmListService.getFormById($stateParams.formId);
        /* $ionicPopup.alert({
             title: 'vm.form ',
             content: vm.form.formId 
         });*/
        //vm.data = $stateParams.item.data;
    } catch (e) {
        $ionicPopup.alert({
            title: 'Error' + $stateParams.formId,
            content: e
        });
    }
});