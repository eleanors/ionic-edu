controller.controller('TaskIndexController', function($scope, $localStorage, $stateParams, $location, Request, $ionicNavBarDelegate) {
    $scope.id = $stateParams.id;
    $scope.status = true;

    if (!$scope.id) {
        return $location.path('/main/grade');
    }

    $scope.fetchTask = function(loading){
        var promise = Request.Task({
            task_id: $scope.id,
            unloading: loading ? true : false
        }).then(function(data){
            $scope.task = data;
            $scope.hasTask = false;
        }, function(data){
            $scope.hasTask = true;
        })
        return promise;
    }

    $scope.refreshHandle = function(){
        $scope.fetchTask(true).finally(function(){
            $scope.$broadcast('scroll.refreshComplete');
        })
    }

    $scope.start = function() {
        Request.StartTask({
            task_id: $scope.id
        }).then(function(result) {
            if (result) {
                $location.path('/main/task-start/' + $scope.id);
            }
        });
    };

    $scope.fetchTask();
});

controller.controller('TaskStartController', function($scope, $localStorage, $ionicPlatform, $timeout, $ionicSlideBoxDelegate, $cordovaCamera, $ionicActionSheet, UploadImg, Public, $ionicModal, $interval, Request, $location, $stateParams, $sce, PhotoSwipe, imageLoaded) {
    $scope.id = $stateParams.id;

    $scope.interval = null;
    $scope.showTime = '00:00';
    $scope.answer_list = [];

    $scope.fetchAnswerList = $scope.reloadTaskList = function(){
        $interval.cancel($scope.interval);

        Request.AnswerList({
            task_id: $scope.id
        }).then(function(result) {
            if (result.task_status === 2 || result.task_status === 3) {
                $location.path('/main/grade');
            }

            $ionicSlideBoxDelegate.$getByHandle('Slide').update();
            //获取用时
            $scope.play_time = result.play_time;

            $scope.interval = $interval(function() {
                $scope.play_time++;
                $scope.showTime = Public.formatSeconds($scope.play_time);
            }, 1000);

            $scope.info = result;
            $scope.answer_list = result.test_list;

            //切换
            $scope.$index = 0;
            $scope.next = function(item) {

                if (item.check && item.check.length > 0) {

                    DoTask(item.test_number, item.check.join(','), function(result) {
                        if (result) {
                            item.is_answered = 1;
                            $ionicSlideBoxDelegate.slide($scope.$index + 1);
                        }
                    });
                } else {
                    $ionicSlideBoxDelegate.slide($scope.$index + 1);
                }
            };

            $scope.radio = [];
            $scope.checkbox = [];
            $scope.content = [];
            $scope.answer = [];

            for (var i in $scope.answer_list) {
                $scope.answer_list[i].num = i;
                switch ($scope.answer_list[i].test_type) {
                    case 1:
                        $scope.radio.push($scope.answer_list[i]);
                        break;
                    case 2:
                        $scope.checkbox.push($scope.answer_list[i]);
                        break;
                    case 3:
                        $scope.content.push($scope.answer_list[i]);
                        break;
                }
            }
            $scope.hasTaskList = false;
        }, function(){
            $scope.hasTaskList = true;
        });
    }

    $scope.fetchAnswerList();

    $scope.fetchContent = $scope.reloadContent = function(){
        $scope.thisQuestion = $scope.answer_list[$scope.$index];
        $scope.thisQuestion.test_type_text = $scope.answer_list[$scope.$index].test_type-1;
        if (!$scope.thisQuestion.content) {
            Request.TaskDetail({
                task_id: $scope.id,
                test_number: $scope.thisQuestion.test_number
            }).then(function(data) {
                //console.log(data);
                if(!angular.isArray(data)) {

                    if ($scope.thisQuestion.is_answered) {
                        Public.DefaultCheck($scope.thisQuestion, data.cloud_data.student_answer);
                    }
                    $scope.thisQuestion.content = data.cloud_data;

                    $scope.thisQuestion = Public.replaceText($scope.thisQuestion);

                    $ionicSlideBoxDelegate.slide($scope.$index);
                    $scope.thisQuestion.status = false;
                }else{
                    $location.path('/main/grade');
                }
            }, function(){
                $scope.thisQuestion.status = true;
            });
        }
    }

    //监听切换状态
    $scope.$watch('$index', function(data) {
        if (data === undefined) return false;
        if ($scope.thisQuestion && $scope.thisQuestion.test_type === 2 && $scope.thisQuestion.change === true) {
            var item = $scope.thisQuestion;
            DoTask(item.test_number, item.check.join(','), function(result) {
                if (result) {
                    item.is_answered = 1;
                    item.change = false;
                }
            });
        }
        if($scope.answer_list.length > 10){
            for(var i in $scope.answer_list){
                if(i < ($scope.$index - 5) || i > ($scope.$index + 5)){
                    delete $scope.answer_list[i].content;
                }
            }
        }
        $scope.fetchContent();

    })

    //点击答题卡跳转题目
    $scope.dump = function(i) {
        $scope.hideModal();
        $ionicSlideBoxDelegate.slide(i);
    };

    //选择

    $scope.checkthis = function(option, type, item) {

        if (type === 'radio') {
            item.check = option;
            DoTask(item.test_number, option, function(result) {
                if (result) {
                    item.is_answered = 1;
                    if ($scope.$index + 1 != $scope.answer_list.length) {
                        $ionicSlideBoxDelegate.slide($scope.$index + 1);
                    }
                }
            });

        } else {
            item.change = true;
            if (!item.check) item.check = [];
            if (item.check.indexOf(option) >= 0) {
                Public.removeByValue(item.check, option);
            } else {
                item.check.push(option);
                item.check = Public.unique(item.check);
            }
        }
    };

    //提交作业
    function DoTask(test_numbser, answer, cb) {
        Request.DoTask({
            task_id: $scope.id,
            test_number: test_numbser,
            answer: answer,
            play_time: $scope.play_time
        }).then(function(result) {
            cb(true);
        }, function(){
            cb(false);
        });
    }

    //解答题图片预览
    $scope.previewPicture = function(num, item, event) {
        var elem = angular.element(event.target);
        if(item == '') return;
        if(elem.prop('loaded')){

            PhotoSwipe.show($scope.thisQuestion.check, num);
        }else{

            if(item.indexOf('?=')>-1){
                $scope.thisQuestion.check[num] = item.split('?=')[0] + '?='+ Math.random();
            }else{
                $scope.thisQuestion.check[num] = item + '?='+ Math.random();
            }
        }
    };

    $scope.change = function($index) {

        $scope.$index = $index;
    };

    //答题卡
    $ionicModal.fromTemplateUrl(
        'templates/task/modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
        $scope.modal = modal;
    });

    $scope.showModal = function() {

        if ($scope.thisQuestion && $scope.thisQuestion.test_type === 2 && $scope.thisQuestion.change === true) {
            var item = $scope.thisQuestion;
            DoTask(item.test_number, item.check.join(','), function(result) {
                if (result) {
                    item.is_answered = 1;
                    item.change = false;
                }
            });
        }
        $scope.modal.show();
    };

    $scope.hideModal = function() {

        $scope.modal.hide();
    };


    //解答题
    $scope.show = function(items) {
        // 显示上拉菜单
        if (!items || !items.check) {
            items.check = [];
        }

        function success(imageData) {

            //上传成功
            if (imageData) {

                items.check.push(imageData);
                DoTask(items.test_number, items.check.join(','), function(result) {
                    if (result) {
                        items.is_answered = 1;
                    }
                });
            } else {
                Public.Toast('请选择一张图片');
            }
        }

        function error(data, type) {
            if (type) {
                items.check.pop();
            }
            return Public.Toast(data);
        }
        UploadImg.show(success, error);
    };

    $scope.modal = false;

    //删除图像
    $scope.remove = function(items, x) {
        var item = angular.copy(items);
        item.check.splice(x, 1);

        DoTask(items.test_number, item.check.join(','), function(result) {
            if (result) {
                items.check.splice(x, 1);
                Public.Toast('删除成功');
                if (items.check.length <= 0) {
                    items.is_answered = 0;
                }
            }
        });
    };


    //完成作业
    $scope.submit = function() {
        var input = '';
        var unanswer = 0;
        for (var i in $scope.answer_list) {
            if ($scope.answer_list[i].is_answered == 0) {
                unanswer++;
            }
        }
        input = unanswer > 0 ? '<p>您还有<span class="uncomplate-count">'+unanswer+'</span>道题没做,确认要提交?' : '同学, 题目检查好了吗?</p>';
        Public.Modal({
            title: '提交作业',
            template: input,
            cssClass: 'complate-task',
            buttons: [{
                text: '交作业'
            }, {
                text: '检查一下'
            }]
        }, function(res) {
            if (res) {
                $scope.submitTask();
            }
        })
    };

    $scope.submitTask = function() {

        $scope.modal.hide();
        Request.SubmitTask({
            task_id: $scope.id,
            play_time: $scope.play_time
        }).then(function(result) {
            if (result.err_code == 0) {
                //todo 成功后跳转
                $location.path('/main/task-info/' + $scope.id).search('redirect', 1);
            } else {
                //todo 失败后提示
                Public.Toast('提交失败');
            }
        });
    };
})




.config(function($ionicConfigProvider) {

    $ionicConfigProvider.scrolling.jsScrolling(true);

});
