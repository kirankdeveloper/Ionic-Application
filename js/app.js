angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'formlyIonic', 'ngCordova', 'formly-ext']).run(function ($ionicPlatform, Auth, $state,$http) {
    $http.defaults.headers.common.Authorization = 'Basic YWRtaW46dDNzdGVy';
    $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
        if (Auth.isAuth()) {
            $state.go('app.formlists');
        }
    });
}).config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider.state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/menu.html',
        controller: 'AppCtrl'
    }).state('signin', {
        url: '/sign-in',
        templateUrl: 'templates/signin.html',
        controller: 'SignInCtrl'
    }).state('app.formlists', {
        url: '/formlists',
        views: {
            'menuContent': {
                templateUrl: 'templates/formlists.html',
                controller: 'FormlistsCtrl'
            }
        }
    }).state('app.options', {
        url: '/options/:formlistId',
        views: {
            'menuContent': {
                templateUrl: 'templates/options.html',
                controller: 'optionsCtrl as vm'
            }
        }
    }).state('app.single', {
        url: '/formlists/:formlistId',
        views: {
            'menuContent': {
                templateUrl: 'templates/formlist.html',
                controller: 'FormlistCtrl as vm'
            }
        },
        params : {
            "formlistId" : ""
        }
    }).state('app.archiveList', {
        url: '/archiveList/:formlistId',
        views: {
            'menuContent': {
                templateUrl: 'templates/archive_list.html',
                controller: 'archiveListCtrl as vm'
            }
        },
        params : {
            "formlistId" : ""
        }
    }).state('app.archive', {
        url: '/archive/',
        views: {
            'menuContent': {
                templateUrl: 'templates/archive.html',
                controller: 'archiveCtrl as vm'
            }
        },
        params : {
            "formId" : "",
            "item" : {}
        }
    }).state('app.subform', {
        url: '/subform/',
        views: {
            'menuContent': {
                templateUrl: 'templates/subform.html',
                controller: 'subFormCtrl as vm'
            }
        },
        params : {
            "formId" : "",
            "item" : {}
        }
    });
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/sign-in');
    // formlyConfigProvider.setTemplateUrl('select_multi', 'templates/form/select_multi.html');

}).run(function ($rootScope, Auth, $state) {

    $rootScope.$on('$stateChangeStart',
        function (event, toState, toParams, fromState, fromParams) {
            console.log(Auth.isAuth(), toState);
            console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
            if (toState.name === 'signin') {
                if (Auth.isAuth()) {

                    event.preventDefault();
                    $state.go('app.formlists');
                }
            } else {
                //console.log(Auth.isAuth());
                if (!Auth.isAuth()) {

                    event.preventDefault();
                    $state.go('signin');
                }
            }
            // transitionTo() promise will be rejected with 
            // a 'transition prevented' error
        });

}).constant('BASE_URL', 'http://localhost:8080');