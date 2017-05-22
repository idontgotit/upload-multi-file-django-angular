/**
 * Created by python on 17/05/2017.
 */
var app = angular.module('myApp', ['ngStorage']);


app.config(function ($interpolateProvider, $httpProvider) {
    $interpolateProvider.startSymbol('{$');
    $interpolateProvider.endSymbol('$}');
    $httpProvider.defaults.xsrfCookieName = 'csrftoken';
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
});


app.controller('RegisterController', function ($scope, $http, $localStorage, FileUploader) {


    var uploader = $scope.uploader = new FileUploader({
        url: '/api/experiments/',
        method: 'POST',
        alias: "file",


    });


    function successFn() {

    }

    function errorFn(data, status, headers, config) {
    }

    $scope.backLogin = function () {
        $scope.loginForm = true;
        $scope.show = false;
    }

    $scope.register = function () {

        $http({
            method: 'POST',
            url: '/api/register/',
            data: {'username': $scope.username, 'password': $scope.password}
        }).then(successFn, errorFn);

    };

    function loadAlldataInUser() {
        return $http({
            method: 'GET',
            url: '/api/users/' + $localStorage.userId + "/posts",
        }).then(function (response) {
            $scope.allPosts = response.data;
        }, function (response) {
        });
    }

    $scope.login = function (name) {
        // console.log('inside');
        //  console.log('username = ' + $scope.username);
        $scope.loginForm = false;
        $localStorage.username = name;
        $scope.show = false;
        $http({
            method: 'GET',
            url: '/api/users/' + name,
        }).then(function (response) {
            $scope.resultUsername = response.data.username;
            $scope.resultPassword = response.data.password;
            $scope.resultId = response.data.id;
            $localStorage.userId = $scope.resultId;
            loadAlldataInUser();
            $scope.show = true;
        }, function (response) {
        });


    };

    $scope.saveNewPost = function () {
        $http({
            method: 'POST',
            url: '/api/posts',
            data: {'title': $scope.newPost.title, 'body': $scope.newPost.body, 'author_id': $localStorage.userId}
        }).then(function (response) {
                $scope.uploadFile(response.data.id)
                    .then(function reloadPage(response) {
                            loadAlldataInUser();
                        }
                    );
            }, function (response) {

            }
        );

    };


    $scope.uploadFile = function (postId) {
        var formData = new FormData();
        // for (var i = 0; i < $scope.files.length; i++) {
        //     formData.append('file'+i, $scope.files[i]);
        // }
        formData.append('length', $scope.files.length);
        for (var i = 0; i < $scope.files.length; i++) {
           formData.append('userpic'+i+"[]", $scope.files[i]._file);
        }
        // formData.append('userpic[]', $scope.files[0]._file, 'chris1.jpg');
        // formData.append('userpic[]', $scope.files[1]._file, 'chris2.jpg');

        // formData.append('file', value);
        // formData.append('file', $scope.files[0]);

        formData.append('post_id', postId);
        return $http.post('/api/experiments/', formData, {
            transformRequest: angular.identity,
            headers: {
                'Content-Type': undefined
            }
        });

    };

    $scope.loadImage = function () {
        $http({
            method: 'GET',
            url: '/api/experiments',
        }).then(function (response) {
            $scope.results = response.data;
        }, function (response) {
        });
    };

    $scope.loadPostImage = function (link) {
        var sublink = link.substr(21);
        $http({
            method: 'GET',
            url: sublink,
        }).then(function success(response) {
            $scope.imageUrl = response.data;
        }, function (response) {


        });
    };

    $scope.files = [];
    $scope.upload = function () {
        alert($scope.files.length + " files selected ... Write your Upload Code");
    };

});

app.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.bind('change', function () {
                $parse(attrs.fileModel).assign(scope, element[0].files)
                scope.$apply();
            });
        }
    };
}]);


app.directive('ngFileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var model = $parse(attrs.ngFileModel);
            var isMultiple = attrs.multiple;
            var modelSetter = model.assign;
            element.bind('change', function () {
                var values = [];
                angular.forEach(element[0].files, function (item) {
                    var value = {
                        // File Name
                        name: item.name,
                        //File Size
                        size: item.size,
                        //File URL to view
                        url: URL.createObjectURL(item),
                        // File Input Value
                        _file: item
                    };
                    values.push(value);
                });
                scope.$apply(function () {
                    if (isMultiple) {
                        modelSetter(scope, values);
                    } else {
                        modelSetter(scope, values[0]);
                    }
                });
            });
        }
    };
}]);