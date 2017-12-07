angular.module('starter.controllers')

.controller('AttendController', ['$scope', 'Request', 'Public', '$interval', '$timeout', '$location', function($scope, Request, Public, $interval, $timeout, $location){

    $scope.search = {
        text: ''
    }

    $scope.grade = {
        classNumber: '10000',
        className: '云课堂高中数学寒假延中校区①',
        teacherName: '圣女',
        subjectName: '高中语文',
        gradeName: '高一'
    }

    $scope.hasClass = true;

    $scope.search = ionic.debounce(function(){
        if(!$scope.search.text){
            return Public.ToastTop('请输入班级编号');
        }
        if($scope.search.text.toString().length!=6){
            return Public.ToastTop('班级编号必须是6位数字');
        }
        if(/^0\d+/g.test($scope.search.text)){
            return Public.ToastTop('查询班级不存在');
        }
        Request.searchClass({
            class_number: $scope.search.text
        }).then(function(data){
            if(data.data && data.data.length){
                angular.forEach(data.data, function(value, key){
                    $scope.grade.classNumber = value.class_number
                    $scope.grade.className = value.class_name
                    $scope.grade.teacherName = value.teacher.name
                    $scope.grade.subjectName = value.subject.name
                    $scope.grade.gradeName = value.grade.name
                })
                $scope.hasClass = false;
            }else {
                $scope.hasClass = true;
                Public.ToastTop('查询班级不存在');
            }
        })
    }, 1e3, true)

    $scope.addClass = function(number){
        if(!number) return;
        var input = '确认加入该班级?';
        var addClass = function(){
            Request.attendClass({
                class_number: number
            }).then(function(data){
                $timeout(function(){

                    $location.path('/main/grade');
                }, 1e3);
                Public.Toast('已成功加入该班级');
            })
        }
        Public.Modal({
            title: '温馨提示',
            template: input
        }, function(status) {
            if (status) {
                addClass();
            }
        })
    }
}])
