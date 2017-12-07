angular.module('starter.controllers')

.controller('CourseController', ['$rootScope', '$scope', 'Request', '$location', '$state', '$timeout', function($rootScope, $scope, Request, $location, $state, $timeout) {

    $scope.courseData = [];
    $scope.initstatus = false;

    $scope.$on('$ionicView.enter', function () {

        $rootScope.hideTabs = false;
    });

    $scope.initial = function(op){
        var promise = Request.attendedClass({
            unloading: op ? true : false
        }).then(function(data){

            if(data.data && data.data.length){

                $scope.courseData = data.data;
            }
            $scope.status = false;
            $scope.initstatus = true;
        }, function(data){

            $scope.status = $scope.initstatus = true;
        })
        return promise;
    }

    $scope.refreshHandle = function(){
        $scope.initial(true).finally(function(){
            $scope.$broadcast('scroll.refreshComplete');
        })
    }

    $scope.showDetailPage = function(item){
        if(item.class_type === 0){

            $state.go('main.courseDetailDaily', {class_number: item.class_number});
        }else if(item.class_type === 1) {

            $state.go('main.courseDetailLive', {class_number: item.class_number});
        }else if(item.task_status == 0 || item.task_status == 1 || item.task_status == 4){

            $state.go('main.task', { id: item.task_id });
        }else if(item.task_status == 2 || item.task_status == 3){

            $state.go('main.task-info', { id: item.task_id });
        }else {}
    }

    $scope.initial();
}])


.controller('CourseDetailDailyController', ['$scope', '$state', '$stateParams', '$timeout', 'Request', function($scope, $state, $stateParams, $timeout, Request){

    $scope.dailyData = {
        class_name: '',
        class_number: '',
        synthesis_level: 'A',
        student_index: '0',
        class_student_count: '0',
        page: 1,
        dailyList: []
    }

    $scope.dailyData.status = false;

    $scope.class_number = $stateParams.class_number;

    $scope.initial = function(op, remain){  // remain->加载更多与初始化数据做区分
        var promise = Request.dailyClassDetail({
            page: $scope.dailyData.page,
            class_number: $scope.class_number,
            unloading: op ? true : false
        }).then(function(data){
            data = angular.copy(data);
            angular.forEach(data.data, function(value, key){
                $scope.dailyData[key] = value;
            })
            if(data.data.task_list && data.data.task_list.length){
                if(remain){
                    angular.forEach(data.data.task_list, function(value){
                        $scope.dailyData.dailyList.push(value);
                    })
                }else{
                    $scope.dailyData.dailyList = data.data.task_list;
                }
            }
            $scope.dailyData.status = false;
            $scope.dailyData.has_next = !!data.data.has_next;
        }, function(){
            $scope.dailyData.status = true;
        });
        return promise;
    }

    $scope.refreshHandle = function(){
        $scope.dailyData.page = 1;
        $scope.initial(true).finally(function(){
            $scope.$broadcast('scroll.refreshComplete');
        })
    }

    $scope.initial();

    $scope.loadMore = function(){
        //if($scope.status) return;
        $scope.dailyData.page++;
        $scope.initial(true, true).finally(function(){
            $scope.$broadcast('scroll.infiniteScrollComplete');
        })
    }

    $scope.reloadMore = ionic.debounce(function(){
        $scope.dailyData.page--;
        $scope.dailyData.status = false;
        $scope.$broadcast('scroll.infiniteScrollComplete');
    }, 1e3, true)

    $scope.showDetailPage = function(item){
        if(item.task_status == 0 || item.task_status == 1 || item.task_status == 4){
            $state.go('main.task', { id: item.task_id });
        }else if(item.task_status == 2 || item.task_status == 3){
            $state.go('main.task-info', { id: item.task_id });
        }
    }

    $scope.showGradeSetting = function(){

        if($scope.dailyData.class_number){
            $state.go('main.courseDetailDailySetting', {class_number: $scope.class_number});
        }
    }
}])

.controller('CourseDetailLiveController', ['$scope', '$location', '$state', '$stateParams', 'AuthService', 'Request', 'Public', function($scope, $location, $state, $stateParams, AuthService, Request, Public){
    /*
     LiveList: [{
     course_id: 1,
     course_name: '高中数学第一讲',
     start_time: '04-07 08:00',
     is_commit: 0,
     course_accuracy: 50.23,
     course_status: 0
     }]
     */
    $scope.liveDate = {
        group_name: '',
        school_name: '',
        student_name: '',
        student_score: '0',
        class_index: '0',
        student_index: '0',
        student_count: '0',
        class_student_count: '0',
        LiveList: []
    };

    $scope.userData = {
        sex: AuthService.getAuthInfo().sex,
        avatar: AuthService.getAuthInfo().img_url
    }

    $scope.class_number = $stateParams.class_number;

    $scope.initial = function(op){
        var promise = Request.liveClassDetail({
            unloading: op ? true : false,
            class_number: $scope.class_number
        }).then(function(data){
            data = angular.copy(data);
            angular.forEach(data.data, function(value, key){

                $scope.liveDate[key] = value;
            })
            if(data.data.course_list && data.data.course_list.length){
                $scope.liveDate.LiveList = data.data.course_list;
            }
            $scope.hasLiveDetail = false;
        }, function(){
            $scope.hasLiveDetail = true;
        });
        return promise;
    }

    $scope.refreshHandle = function(){
        $scope.initial(true).finally(function(){
            $scope.$broadcast('scroll.refreshComplete');
        })
    }

    $scope.showDetailListPage = function(item){

        if(angular.isObject(item)){
            if(item.course_status == 1){
                $state.go('main.courseDetailLiveList', {
                    group_id: $scope.liveDate.group_id,
                    school_id: $scope.liveDate.school_id,
                    course_id: item.course_id
                });
            }else{
                Public.Toast('尚未开课, 无法查看');
            }
        }
    }

    $scope.initial();
}])


.controller('CourseDetailLiveListController', ['$scope', '$location', '$state', '$stateParams', '$ionicPlatform', '$sce', 'Request', function($scope, $location, $state, $stateParams, $ionicPlatform, $sce, Request){

    /**
     {
         task_id: 1,
         task_name: '高中数学第一讲',
         deadline_time: 1496505599,
         task_test_count: 0,
         task_accuracy: 50.23,
         task_type: 0,
         task_status: 0
     }
     */
    $scope.liveListDate = {
        course_name: '',
        school_name: '',
        student_score: '0',
        class_index: '0',
        student_index: '0',
        student_count: '0',
        class_student_count: '0',
        video_url: '',

        liveList: []
    };

    $scope.school_id = $stateParams.school_id;
    $scope.group_id = $stateParams.group_id;
    $scope.course_id = $stateParams.course_id;


    $scope.video = {};

    $scope.video.config = {
        autoHide: true,
        autoHideTime: 3000,
        autoPlay: false,
        sources: [],
        video_index: 0
    };

    $scope.initial = function(op){
        var promise = Request.liveClassListDetail({
            school_id: $scope.school_id,
            group_id: $scope.group_id,
            course_id: $scope.course_id,
            unloading: op ? true : false
        }).then(function(data){
            data = angular.copy(data);
            angular.forEach(data.data, function(value, key){

                $scope.liveListDate[key] = value;
            })
            if(data.data.task_list && data.data.task_list.length){
                $scope.liveListDate.liveList = data.data.task_list;
            }
            $scope.setVideoSource(data.data.video_url);
            $scope.hasLiveDetail = false;
        }, function(){

            $scope.hasLiveDetail = true;
        });
        return promise;
    }

    $scope.refreshHandle = function(){
        $scope.VIDEO && $scope.VIDEO.stop();
        setTimeout(function(){
            $scope.initial(true).finally(function(){
                $scope.$broadcast('scroll.refreshComplete');
            })
        }, 1000)

    }

    $scope.onPlayerReady = function(VIDEO) {
        $scope.VIDEO = VIDEO;
    };

    $scope.$on('$ionicView.beforeLeave', function() {
        $scope.VIDEO && $scope.VIDEO.stop();
    });

    $ionicPlatform.ready(function() {
        var handler = $ionicPlatform.registerBackButtonAction(function(e) {
            $scope.VIDEO && $scope.VIDEO.stop();
        })
        $ionicPlatform.on('pause', function () {
            $scope.VIDEO && $scope.VIDEO.stop();
        });
        $scope.$on('$destroy', handler);
    });

    $scope.setVideoSource = function(video_url){
        if (video_url && video_url.indexOf('.mp4')>-1) {

            $scope.video.config.sources = [
                { src: $sce.trustAsResourceUrl(video_url), type: "video/mp4" },
            ];
        }
    }

    $scope.videoError = function(error){

    }

    $scope.showDetailPage = function(item){
        if(item.task_type == 0) {
            if(item.task_status == 2 || item.task_status == 3){
                $state.go('main.task-info', { id: item.task_id });
            } else {   // 0 | 1 | 4
                $state.go('main.task', { id: item.task_id });
            }
        }else{
            $state.go('main.task-info', { id: item.task_id });
        }
    }

    $scope.initial();
}])


.controller('CourseDailySettingontroller', ['$scope', '$stateParams', '$timeout', '$location', 'Request', 'Public', function($scope, $stateParams, $timeout, $location, Request, Public){

    $scope.class_number = $stateParams.class_number;

    $scope.courseData = {};

    $scope.initial = function(op){
        if(!$scope.class_number) return;
        var promise = Request.searchClass({
            unloading: op ? true : false,
            class_number: $scope.class_number
        }).then(function(data){
            if(data.data && data.data.length){
                $scope.courseData = data.data[0];
            }
            $scope.hasClass = false;
        }, function(data){
            $scope.hasClass = true;
        })
        return promise;
    }

    $scope.refreshHandle = function(){
        $scope.initial(true).finally(function(){
            $scope.$broadcast('scroll.refreshComplete');
        })
    }

    $scope.leaveClass = function(){
        if(!$scope.class_number) return;
        var leave = function(){
            Request.quitClass({
                class_number: $scope.class_number
            }).then(function(){
                $timeout(function(){

                    $location.path('/main/grade');
                }, 1e3);
                Public.Toast('已成功退出该班级');
            })
        };
        var input = '确认退出该班级?';
        Public.Modal({
            title: '温馨提示',
            template: input,
            cssClass: 'modal-leave-class'
        }, function(status) {
            if (status) {
                leave();
            }
        })
    }

    $scope.showDetailPage = function(item){
        if(item.task_status == 0 || item.task_status == 1 || item.task_status == 4){
            $state.go('main.task', { id: item.task_id });
        }else if(item.task_status == 2 || item.task_status == 3){
            $state.go('main.task-info', { id: item.task_id });
        }
    }

    $scope.initial();
}])
