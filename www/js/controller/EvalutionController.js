angular.module('starter.controllers')

.controller('DailyEvalutionController', ['$scope', '$timeout', 'evalutionScore', '$stateParams', 'Request', function($scope, $timeout, evalutionScore, $stateParams, Request){

    $scope.title = '';
    $scope.distance = null;

    $scope.evalutionData = {
        student_index: 0,
        class_student_count: 0,
        average_accuracy: 0,
        max_accuracy: 0,
        student_accuracy: 0,
        synthesis_level: 'A',
        class_name: '',
        lore_list: []
    }

    $scope.class_number = $stateParams.class_number;

    $scope.initial = function(op){
        var promise = Request.classReport({
            unloading: op ? true : false,
            class_number: $scope.class_number
        }).then(function(data){
            if(data.data && !angular.isArray(data.data)){
                var lore_list = [];
                $scope.evalutionData = data.data;
                if(data.data.lore_list && data.data.lore_list.length){
                    angular.forEach(data.data.lore_list, function(value, key){
                        lore_list.push({
                            student_score:  value.student_score,
                            average_score: value.average_score,
                            max_score: value.max_score
                        })
                    })
                }
                $scope.distance = angular.copy(lore_list);
                evalutionScore.setScore($scope.distance);
                $scope.status = false;
            }else{
                $scope.status = false;
            }
        }, function(data){
            $scope.status = true;
        })
        return promise;
    }

    $scope.refreshHandle = function(){
        $scope.initial(true).finally(function(){
            $scope.$broadcast('scroll.refreshComplete');
        })
    }

    $scope.initial()
}])


.controller('LiveEvalutionController', ['$scope', '$timeout', 'evalutionScore', '$stateParams', 'Request', function($scope, $timeout, evalutionScore, $stateParams, Request){

    $scope.title = '';
    $scope.distance = null;

    $scope.evalutionData = {
        student_index: 0,
        class_student_count: 0,
        average_accuracy: 0,
        max_accuracy: 0,
        student_accuracy: 0,
        synthesis_level: 'A',
        school_name: '',
        course_name: '',
        student_name: '',
        lore_list: []
    }


    $scope.course_id = $stateParams.course_id;

    $scope.initial = function(op){
        var promise = Request.courseReport({
            course_id: $scope.course_id,
            unloading: op ? true : false
        }).then(function(data){
            if(data.data && !angular.isArray(data.data)){

                var lore_list = [];
                $scope.evalutionData = data.data;
                if(data.data.lore_list && data.data.lore_list.length){
                    angular.forEach(data.data.lore_list, function(value, key){
                        lore_list.push({
                            student_score:  value.student_score,
                            average_score: value.average_score,
                            max_score: value.max_score
                        })
                    })
                }
                $scope.distance = angular.copy(lore_list);

                evalutionScore.setScore($scope.distance);
                $scope.status = false;
            }else{
                $scope.status = false;
            }
        }, function(data){
            $scope.status = true;
        })
        return promise;
    }

    $scope.refreshHandle = function(){
        $scope.initial(true).finally(function(){
            $scope.$broadcast('scroll.refreshComplete');
        })
    }

    $scope.initial()
}])


.filter('reviseScoreFilter', function(){
    return function(value){
        if(angular.isNumber(value) && !isNaN(value)){
            if(value > 98){
                return 98;
            }else{
                return value;
            }
        }
    }
})

.service('evalutionScore', [function(){
    this.score = null;
    this.distance = 15;
    this.isApproach = false;

    /**
     * reset persent
     * return score persent...
     */
    this.compare = function(){
        var result = [];

        angular.forEach(this.score, function(value){
            var index = 0;
            var score = [];
            angular.forEach(value, function(val, key){
                score.push(val)
            })
            angular.forEach(score, function(value, key){
                var a = Math.round(score[0]),
                    b=Math.round(score[1]),
                    c=Math.round(score[2]);

                if(c <= 90){
                    if(Math.abs(c-b) <= 3){
                        score[2] = c + 2;
                    }

                    if(b > 9 && Math.abs(c-b) <= 5) {
                        score[1] = b - 1;
                        score[2] = c + 2;
                    }
                }
                if(c >= 90){
                    if(Math.abs(c-b) <= 5){
                        score[1] = b - 4;
                        score[2] = c;
                    }
                }
                if(c >= 96){
                    if(Math.abs(c-b) <= 6){
                        score[1] = c - 5;
                        score[2] = c - 2;
                    }
                }

                if(a >= 96){ score[0] = 94;}
                if(c >= 96){ score[2] = 94;}
                if(b >= 90){ score[1] = 88;}
                if(b == 100){ score[1] = 82;}
                if(c == 100){ score[2] = 92;}
                if(a == 100){ score[0] = 92;}
            })

            angular.forEach(value, function(val, key){
                value[key] = score[index++];
            })
            result.push(value);
        })

        this.score = result;
    }

    this.update= function(){}

    this.setScore = function(score){

        this.score = score;
        this.compare()
        return this.score;
    }
}])
