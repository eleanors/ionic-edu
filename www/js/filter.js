angular.module('starter.filter', [])

    .filter('TestType', function() {
        var type = ['未知题型','单选题', '多选题', '解答题'];
        return function(value) {
            if(!type[value]) return type[0];
            return type[value];
        };
    })

    .filter('AnswerType', function() {
        var type = ['待批阅', '正确', '错误', '20%正确', '50%正确', '80%正确', '10%正确', '30%正确', '40%正确', '60%正确', '70%正确', '90%正确'];

        return function(value) {
            if(!type[value]) return type[0];
            return type[value];
        };
    })


.filter('courseType', ['Public', function(Public){
    var text = '';
    return function(value, accuracy, time){
        if(value == 0 || value == 1){
            text = Public.formatTime(time*1000, 'MM月dd日 hh:mm') + '截止';
        }else if(value == 2){
            text = '待批阅';
        }else if(value == 3){
            text = '正确率'+accuracy+'%';
        }else if(value == 4){
            text = '逾期未交';
        }
        return text;
    }
}])

.filter('trusted', ['$sce', function ($sce) {
    return function(url) {
        return $sce.trustAsResourceUrl(url);
    };
}])

.filter('parseIntFilter', function(){
    return function(value){
        if(angular.isNumber(value) && !isNaN(value)){
            return Math.round(value);
        }else{
            return 0;
        }
    }
})

.filter('avatarFilter', function(){
    return function(url, sex){
        if(!url) {
            if(sex === 0) {
                url = 'img/avatar-man.png';
            }else {
                url = 'img/avatar-woman.png';
            }
        }
        return url;
    }
})

.filter('addListIndex', function(){
    return function(topic, index){
        if(topic && index) {
            return index + '. ' + topic.replace(/<(?!img)[^>]*>/g, '');
        }
    }
})

.filter('pictureLoadComplete', ['Public', function(Public){
    return function(value, type){
        if(value) {
            return Public.resetImg(value, type);
        }
    }
}])
