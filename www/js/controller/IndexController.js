var controller = angular.module('starter.controllers', [])
.run(['$rootScope', '$ionicLoading', function($rootScope, $ionicLoading) {
    $rootScope.$on('loading', function(event, data) {
        $rootScope.loadText = '加载中...';
        var isShow = data;
        if (angular.isArray(data)) {
            isShow = data[0];
            $rootScope.loadText = data[1];
        }
        if (isShow) {
            $ionicLoading.show({
                template: '<ion-spinner></ion-spinner><span ng-bind="$root.loadText"></span>'
            });
        } else {
            $ionicLoading.hide();
        }
    });
}])
