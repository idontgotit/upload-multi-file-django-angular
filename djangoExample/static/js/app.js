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

app.service('apiService', ['$http', function ($http) {
    var result;
    this.registerApi = function (username, password) {
        result = $http({
            method: 'POST',
            url: '/api/register/',
            data: {'username': username, 'password': password}
        });

        return result;
    };

    this.getAllPostUserApi = function (userId) {
        result = $http({
            method: 'GET',
            url: '/api/users/' + userId + "/posts",
        });

        return result;
    };

    this.getUserByNameApi = function (userName) {
        result = $http({
            method: 'GET',
            url: '/api/users/' + userName,
        });
        return result;
    };

    this.addNewPost = function (title, body, number_positive, number_float, user_id) {
        result = $http({
            method: 'POST',
            url: '/api/posts',
            data: {
                'title': title,
                'body': body,
                'number_positive': number_positive,
                'number_float': number_float,
                'author_id': user_id,
            }
        });
        return result;
    };

    this.postMultiImage = function (form_data) {
        result = $http.post('/api/experiments/', form_data, {
            transformRequest: angular.identity,
            headers: {
                'Content-Type': undefined
            }
        });
        return result;
    };

    this.deletePost = function (id) {
        result = $http({
            method: 'DELETE',
            url: '/api/posts/' + id,
        });
        return result;
    };

    this.editPostByPut = function (post_id, number_count, title, body, number_positive, number_float, authorId) {
        result = $http({
            method: 'PUT',
            url: '/api/posts/' + post_id,
            data: {
                'numberCount': number_count,
                'title': title,
                'body': body,
                'number_positive': number_positive,
                'number_float': number_float,
                'author_id': authorId
            }
        });
        return result;
    };

    this.editPostByPatch = function (id, object_data) {
        result = $http({
            method: 'PATCH',
            url: '/api/posts/' + id,
            data: object_data
        });
        return result;
    };


}]);

// app.facroty('example', ['$http', '$q', function($http, $q){
//
// }]);

app.controller('RegisterController', ['$scope', '$http', '$localStorage', 'apiService', '$q',
    function ($scope, $http, $localStorage, apiService, $q) {


        $scope.uploadFile = function (postId) {
            var upload = $q.defer();
            if ($scope.files) {
                var formData = new FormData();
                formData.append('length', $scope.files.length);
                for (var i = 0; i < $scope.files.length; i++) {
                    formData.append('userpic' + i + "[]", $scope.files[i]._file);
                }
                formData.append('post_id', postId);
                apiService.postMultiImage(formData).then(function () {
                    upload.resolve();
                });
            } else {
                upload.resolve();
            }
            return upload.promise;
        };

        $scope.backLogin = function () {
            $scope.loginForm = true;
            $scope.show = false;
        };

        $scope.register = function () {
            var result = apiService.registerApi($scope.username, $scope.password);
        };

        function loadAlldataInUser() {
            return apiService.getAllPostUserApi($localStorage.userId).then(function (response) {
                var allPostsOrigin = response.data;
                for (var i = 0; i < allPostsOrigin.length; i++) {
                    // init value for render
                    allPostsOrigin[i].viewMode = true;
                    allPostsOrigin[i].errorNumberPos = false;
                    allPostsOrigin[i].errorTitle = false;
                    allPostsOrigin[i].errorNumberFloat = false;
                    allPostsOrigin[i].numberCount = i;
                }
                $scope.allPosts = allPostsOrigin;
            }, function (response) {
            });
        }

        $scope.login = function (name) {
            $scope.loginForm = false;
            $localStorage.username = name;
            $scope.show = false;
            apiService.getUserByNameApi(name)
                .then(function (response) {
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
            apiService.addNewPost($scope.newPost.title, $scope.newPost.body,
                $scope.newPost.number_positive, $scope.newPost.number_float, $localStorage.userId)
                .then(function (response) {
                        $scope.uploadFile(response.data.id)
                            .then(function reloadPage(response) {
                                    loadAlldataInUser();
                                    clearDataNewPost();
                                }
                            );
                    }, function (response) {
                        loadAlldataInUser();

                    }
                );
        };

        function clearDataNewPost() {
            $scope.files = undefined;
            $scope.newPost.title = "";
            $scope.newPost.body = "";
            $scope.newPost.number_positive = "";
            $scope.newPost.number_float = "";
            angular.element("input[type='file']").val(null);
        }


        $scope.deletePost = function (current_post) {
            apiService.deletePost(current_post.id).then(function (response) {
                    loadAlldataInUser();
                }, function (response) {
                }
            );
        };

        // find number different 2 object without exclude field
        function findDiff(original, edited, exclude_field) {
            var diff = {};
            for (var key in original) {
                if ((exclude_field.indexOf(key) === -1) && (original[key] !== edited[key]))
                    diff[key] = edited[key];
            }
            return diff;
        }

        function countProperties(obj) {
            var count = 0;
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    ++count;
                }
            }
            return count;
        }

        function handleExceptionEdit(response) {
            var i = response.config.data.numberCount;
            if (response.data.title) {
                $scope.allPosts[i].errorTitle = true;
                $scope.allPosts[i].messTitle = response.data.title.toString();
            }
            if (response.data.number_positive) {
                $scope.allPosts[i].errorNumberPos = true;
                $scope.allPosts[i].messNumberPos = response.data.number_positive.toString();
            }
            if (response.data.number_float) {
                $scope.allPosts[i].errorNumberFloat = true;
                $scope.allPosts[i].messNumberFloat = response.data.number_float.toString();
            }
        }

        $scope.saveEditPost = function (edited_post, origin_post) {
            var exclude_field = ['experiments', 'author', '$$hashKey', 'viewMode'];
            var objectChange = findDiff(origin_post, edited_post, exclude_field);
            objectChange.numberCount = origin_post.numberCount;
            //if change all field
            if (countProperties(objectChange) >= 4) {
                apiService.editPostByPut(origin_post.id, origin_post.numberCount, edited_post.title,
                    edited_post.body, edited_post.number_positive, edited_post.number_float, origin_post.author.id)
                    .then(function (response) {
                            loadAlldataInUser();
                            // must call put or patch for update image
                            // $scope.uploadFile(current_post.id)
                            //     .then(function reloadPage(response) {
                            //             loadAlldataInUser();
                            //             // $scope.createNewPost.$setPristine();
                            //         }
                            //     );
                        }, function (response) {
                            handleExceptionEdit(response);
                        }
                    );
            }
            else {
                apiService.editPostByPatch(origin_post.id, objectChange).then(function (response) {
                        edited_post.viewMode = true;
                        loadAlldataInUser();
                    }, function (response) {
                        handleExceptionEdit(response);
                    }
                );
            }

        };

        $scope.editPost = function (current_post) {
            $scope.selectedPost = angular.copy(current_post);
            current_post.viewMode = false;
        };
        $scope.cancelEditPost = function (current_post) {
            $scope.selectedPost = {};
            current_post.viewMode = true;
        };
    }
]);

