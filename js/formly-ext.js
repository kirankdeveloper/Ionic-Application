angular.module("formly-ext", ["formlyIonic"]);
angular.module("formly-ext").config(["formlyConfigProvider",
    function (formlyConfigProvider) {

        formlyConfigProvider.setWrapper({
            name: 'validation',
            types: ['input', 'stacked-input', 'textarea', 'checkbox','date-time','multi-level-select'],
            template: ' <formly-transclude></formly-transclude>' +
                '<div ng-messages="fc.$error" ng-if="form.$submitted || options.formControl.$touched" class="error-messages">' +
                '<div ng-message="{{::name }}" ng-repeat="(name, message) in fc.$error" class="message">{{ to.validation.messages[name]}} {{name === "min" ? to.min : ""}} {{name === "max" ? to.max : ""}}</div>' +
                '</div>'
        });
        formlyConfigProvider.setWrapper({
            name: 'custom_validation',
            types: ['signature', 'camera', 'gallery','sub-form'],
            template: ' <formly-transclude></formly-transclude>' +
                '<div ng-messages="$customError" ng-if="form.$submitted"  class="error-messages">' +
                '<div ng-message="{{::name }}" ng-repeat="(name, message) in $customError" class="message">{{ to.validation.messages[name]}} {{name === "min" ? to.min : ""}} {{name === "max" ? to.max : ""}}</div>' +
                '</div>'
        });
        /* formlyConfigProvider.setWrapper({
            name: 'remove',
            types: ['input', 'stacked-input', 'multi-level-select', 'signature', 'textarea', 'checkbox', 'camera', 'gallery'],
            template: ' <formly-transclude></formly-transclude>' +
                '<i class="ion-arrow-up-a icon-up" dir="up" to="{{to}}" onclick="angular.element(this).parent().parent().scope().arrangeFields(this);"></i>' +
                '<i class="ion-close-circled icon-close" to="{{to}}" onclick="angular.element(this).parent().parent().scope().dettachField(this);"></i>' +
                '<i class="ion-arrow-down-a icon-down" dir="down" to="{{to}}" onclick="angular.element(this).parent().parent().scope().arrangeFields(this);"></i>'
        });
*/

    }
]);

angular.module("formly-ext").run(["formlyConfig", "formlyValidationMessages",
    function (formlyConfig, formlyValidationMessages) {
        "use strict";
        formlyConfig.setType({
            name: "multi-level-select",
            template: '<label class="item item-input item-stacked-label"><span class="input-label" aria-label="{{::to.label}}">{{::to.label}}</span> <label class="item item-input item-select"><span class="input-label">{{::options.data.keys[0]}}</span><select ng-options="item.value for item in options.data.data" class="form-control" ng-model="model[options.data.keys[0]]"></select></label><label class="item item-input item-select" ng-repeat="key in options.data.keys" ng-if="!$last"><span class="input-label">{{::options.data.keys[$index + 1]}}</span><select ng-options="item.value for item in model[key].sub" class="form-control" ng-model="model[options.data.keys[$index + 1]]"></select></label></label>'
        });
       formlyConfig.setType({
            name: "date-time",
            template: '<label class="item item-input">' +
                '<span class="input-label">{{::to.label}}</span>' +
                '<input type="{{to.type}}" ng-required="to.required" ng-model="model[options.key]"  ng-min="to.min" ng-max="to.max">' +
                '</label>',
            controller: function ($scope, $cordovaCamera) {
                if($scope.options.defaultValue) {
                    $scope.model[$scope.options.key] = new Date();
                }
            }

        });
        formlyConfig.extras.errorExistsAndShouldBeVisibleExpression = 'fc.$touched || form.$submitted';

        formlyConfig.setType({
            name: 'camera',
            template: '<label class="item item-input item-stacked-label"><span class="input-label" aria-label="{{to.label}}">{{to.label}}</span> <button type="button" class="button button-full button-assertive" ng-click="takePhoto(model,options)" >Take Photo </button></label>' +
                '<img ng-show="model[options.key]" ng-src="{{model[options.key]}}"     style="text-align: center" />',
            defaultOptions: {},
            controller: function ($scope, $cordovaCamera) {
                console.log("............>>>>>>>>>>>>>>>>>...................");
                $scope.form.customErrors = $scope.form.customErrors || {};
                $scope.form.customErrors[$scope.options.key] = true;
                console.dir($scope);
                if ($scope.to.required) {
                    $scope.$customError = {
                        required: true
                    };
                    
                }
               //  alert($scope.model[$scope.options.key]);
                $scope.takePhoto = function (model, options) {
                    options = {
                        quality: 75,
                        destinationType: Camera.DestinationType.DATA_URL,
                        sourceType: Camera.PictureSourceType.CAMERA,
                        allowEdit: false,
                        encodingType: Camera.EncodingType.JPEG,
                        targetWidth: 600,
                        targetHeight: 600,
                        popoverOptions: CameraPopoverOptions,
                        saveToPhotoAlbum: true
                    };
                    $cordovaCamera.getPicture(options).then(function (imageData) {
                        $scope.imgURI = "data:image/jpeg;base64," + imageData;
                        delete $scope.form.customErrors[$scope.options.key];
                        $scope.$customError = {};
                        //$scope.form.$setValidity("required", true);
                        $scope.model[$scope.options.key] = "data:image/jpeg;base64," + imageData;
                    }, function (err) {
                        /* if ($scope.to.required) {
                            scope.form.$setValidity("required", false);
                        }*/
                        // An error occured. Show a message to the user
                    });
                };
            }
        });
        formlyConfig.setType({
            name: 'gallery',
            template: '<label class="item item-input item-stacked-label"><span class="input-label" aria-label="{{to.label}}">{{to.label}}</span> <button type="button" class="button button-full button-assertive"  ng-click = "choosePhoto(model,options)" > Choose Photo </button></label><img ng-show="model[options.key]" ng-src="{{model[options.key]}}" style="text-align: center" />',
            defaultOptions: {},
            controller: function ($scope, $cordovaCamera) {
                console.log("............>>>>>>>>>>>>>>>>>...................");
                $scope.form.customErrors = $scope.form.customErrors || {};
                $scope.form.customErrors[$scope.options.key] = true;
                console.dir($scope);
                if ($scope.to.required) {
                    $scope.$customError = {
                        required: true
                    };
                    /* $scope.$watch(function () {
                        return $scope.form.$submitted;
                    }, function () {
                        if ($scope.form.$submitted) {
                            console.log('required should set here');
                            if (!$scope.imgURI) {
                                //$scope.form.$setValidity("required", false);
                            }
                        }
                    });*/
                }

                $scope.choosePhoto = function (model, options) {
                    options = {
                        quality: 75,
                        destinationType: Camera.DestinationType.DATA_URL,
                        sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                        allowEdit: false,
                        encodingType: Camera.EncodingType.JPEG,
                        targetWidth: 600,
                        targetHeight: 600,
                        popoverOptions: CameraPopoverOptions,
                        saveToPhotoAlbum: false
                    };
                    $cordovaCamera.getPicture(options).then(function (imageData) {
                        $scope.model[$scope.options.key] = "data:image/jpeg;base64," + imageData;
                        delete $scope.form.customErrors[$scope.options.key];
                        $scope.$customError = {};
                    }, function (err) {
                        // An error occured. Show a message to the user
                    });
                };
            }
        });
        formlyConfig.setType({
            name: "signature",
            template: '<label class="item item-input item-stacked-label"><span class="input-label" aria-label="{{to.label}}">{{to.label}}</span><button type="button" class="button button-full button-assertive"  ng-click = "openModal(model,options)" > Signature </button></label><img ng-show="model.signature !== undefined" ng-src="{{model.signature}}" style="text-align: center" />',
            defaultOptions: {},
            controller: function ($scope, $ionicModal) {
                console.log("............>>>>>>>>>>>>>>>>>...................");
                $scope.form.customErrors = $scope.form.customErrors || {};
                $scope.form.customErrors[$scope.options.key] = true;
                console.dir($scope);
                if ($scope.to.required) {
                    $scope.$customError = {
                        required: true
                    };
                }

                var signaturePad;
                var canvas;
                var sign = $ionicModal.fromTemplate('<ion-modal-view><ion-pane><ion-header-bar class="bar-stable"><h1 class="title"> Signature </h1><ion-header-buttons side="left"><button class="button signature-back-button" ng-click="closeModal()"><i class="icon ion-ios-arrow-back"></i> Back</button></ion-header-buttons></ion-header-bar><ion-content class="has-header" scroll="false"><canvas id="signatureCanvas"></canvas><div class="button-bar"><a class="button button-positive" ng-click="clearCanvas()">Clear</a><a class="button button-balanced" ng-click="saveCanvas(); closeModal()">Done</a></div><br></ion-content></ion-pane></ion-modal-view>', {
                    scope: $scope,
                    animation: 'slide-in-up'
                });
                $scope.openModal = function (model, options) {
                    sign.show();
                    canvas = document.getElementById('signatureCanvas');
                    signaturePad = new SignaturePad(canvas);
                };
                $scope.closeModal = function () {
                    sign.hide();
                };
                $scope.$on('$destroy', function () {
                    sign.remove();
                });
                $scope.clearCanvas = function () {
                    signaturePad.clear();
                };
                $scope.saveCanvas = function () {
                    var sigImg = signaturePad.toDataURL();
                    $scope.model[$scope.options.key] = sigImg;
                    delete $scope.form.customErrors[$scope.options.key];
                    $scope.$customError = {};
                    console.log(sigImg);
                };
            }
        });

        formlyConfig.setType({
            name: "sub-form",
            template: '<label class="item item-input item-stacked-label"><span class="input-label" aria-label="{{to.label}}">{{to.label}}</span><button type="button" class="button button-full button-assertive"  ng-click = "openSubForm(model,options)" > Open </button></label>',
            defaultOptions: {},
            controller: function ($scope, $ionicModal, $state,  $ionicPopup) {
                console.log("............>>>>>>>>>>>>>>>>>...................");
                            
                $scope.openSubForm = function (model, options) {
                   
                    try{
                    $state.go("app.subform", {'formId': $scope.to.formId});

                    }catch(e) {
                         $ionicPopup.alert({
                        title: 'e' ,
                        content: e
                    });
                    }
                };
               
            }
        });
    }
]);
