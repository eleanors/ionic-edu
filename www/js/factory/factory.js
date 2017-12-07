angular.module('starter.factories')

.factory('PhotoSwipe', ['$rootScope', '$compile', '$ionicPlatform', '$ionicBody', '$q', function($rootScope, $compile, $ionicPlatform, $ionicBody, $q) {

    return {
        show: function(pictures, index, scope){
            var scope = $rootScope.$new(true);
            var defer = $q.defer();

            angular.extend(scope, {pictures: pictures, index: index});

            var element = scope.element = $compile('<photo-swipe></photo-swipe>')(scope);

            var body = document.getElementsByTagName('body')[0];
            body.appendChild(element[0]);
            scope.preload = function(list, callback){
                var items = [],
                    index = 0;
                for(var i=0, len=list.length; i<len; i++){
                    var img = new Image();
                    img.src = list[i];
                    img.index = i;
                    img.onload=function(){
                        var rw = this.width;
                        var rh = this.height;
                        if(!rw ){
                            rw = 100;
                        }
                        if(!rh ){
                            rh = 100;
                        }
                        items.push({
                            src: this.src,
                            w: rw,
                            h: rh,
                            index: this.index,
                            initialPosition: {x:0,y:365}
                        });
                        img = null;
                        index++;
                        if(index == list.length){
                            callback(items);
                        }
                    }
                    img.onerror = function(){

                        items.push({
                            src: 'img/broken.png',
                            w: 500,
                            h: 500,
                            index: this.index
                        });
                        index++;
                        if(index == list.length){
                            callback(items);
                        }
                    }
                }
            }

            scope.cancel = function(){}
        }
    }
}])

.factory('CameraAndPhoto', ['$q', function($q) {
    return {
        openAlbum: function() {
            var q = $q.defer();
            if (!ImageProcess.openAlbum) {
                q.resolve(null);
                return q.promise;
            }

            ImageProcess.openAlbum('', function(imageData) {
                q.resolve(imageData);
            }, function(error) {
                q.reject(error);
            });

            return q.promise;
        },
        openCrop: function(imageData) {
            var q = $q.defer();
            if (!ImageProcess.openCrop) {
                q.resolve(null);
                return q.promise;
            }
            if (!imageData) {
                q.reject(null);
                return q.promise;
            }
            ImageProcess.openCrop('', imageData, function(imageData) {
                q.resolve(imageData);
            }, function(error) {
                q.reject(error);
            });

            return q.promise;
        },
        openCamera: function() {
            var q = $q.defer();
            if (!ImageProcess.openCamera) {
                q.resolve(null);
                return q.promise;
            }

            ImageProcess.openCamera('', function(imageData) {
                q.resolve(imageData);
            }, function(error) {
                q.reject(error);
            });

            return q.promise;
        }
    }
}])



.factory('sharePicker', ['$rootScope', '$compile', '$animate', '$timeout', '$ionicPlatform', '$ionicBody', function($rootScope, $compile, $animate, $timeout, $ionicPlatform, $ionicBody) {

    var noop = angular.noop;
    return { show: Picker };
    function Picker(option) {
        var options = {
            cancel: noop,
            buttonClicked: noop,
            buttons: []
        }
        var scope = $rootScope.$new(true);
        angular.extend(scope, options, option);
        var element = scope.element = $compile('<custom-picker><div></div></custom-picker>')(scope);

        var pickerWrap = angular.element(element[0].querySelector('.custom-picker-wrapper'));
        scope.showPicker = function(done) {
            if(scope.removed) return;
            $ionicBody.append(element).addClass('custom-picker-open');
            $animate.addClass(element, 'active').then(function(){
                if(scope.removed) return;
                (done || noop)();
            })
            $timeout(function(){
                if(scope.removed) return;
                pickerWrap.addClass('custom-picker-up');
            }, 60, false);
        }

        scope.removePicker = function(done){
            if(scope.removed) return;
            scope.removed = true;

            pickerWrap.removeClass('custom-picker-up');
            $timeout(function(){
                $ionicBody.removeClass('custom-picker-open');
            }, 400);

            scope.$deregisterBackButton();

            $animate.removeClass(element, 'active').then(function(){
                scope.$destroy();
                element.remove();
                pickerWrap = scope.cancel.$scope = null;
                (done || noop)(options.buttons)
            })
        }

        scope.buttonClicked = function(index){
            if (option.buttonClicked(index, option.buttons[index]) === true) {
                scope.removePicker();
            }
        }

        scope.cancel = function() {
            scope.removePicker(options.cancel);
        }

        scope.$deregisterBackButton = $ionicPlatform.registerBackButtonAction(
                function() {
                        $timeout(scope.cancel);
                }, 300
        );

        scope.showPicker();
    }
}])

/**
    向上  只有一项选中  并且不在栈顶
    向下  只有一项选中  并且不在栈底
    type      单选  多选   解答
    topic     当前type下所有数据
    checked   topic -> item -> checked  标识已选中项
    modal = [{
        type: 1,
        topic: []
    }, {
        type: 2,
        topic: []
    }]
 */
.factory('MoveOrder', ['Public', function(Public){
        var modalStack = [];
        var checkedStack = [];
        stack = {

                addModal: function(modal){
                        modalStack = modal;
                },

                removeItem: function(item, type){
                        modalStack[type].topic.splice(modalStack[type].topic.indexOf(item), 1);
                },

                moveItem: function(type, initIndex, newIndex){
                        var item = modalStack[type].topic;
                        if(newIndex > item.length){
                                var remain = newIndex - item.length;
                                while((remain--)+1){
                                    item.push('');
                                }
                        }
                        item.splice(newIndex, 0, item.splice(initIndex, 1)[0]);
                        return item;
                },

                prevMoveItem: function(type, initIndex, newIndex){
                        var cache = angular.copy(modalStack);
                        var item = cache[type].topic;
                        if(newIndex > item.length){
                                var remain = newIndex - item.length;
                                while((remain--)+1){
                                    item.push('');
                                }
                        }
                        item.splice(newIndex, 0, item.splice(initIndex, 1)[0]);
                        return cache;
                },

                checkedItem: function(){
                        var checked = [];
                        modalStack.forEach(function(modal, index){
                                var item = modal.topic.filter(function(item, index){
                                        return !!item.checked;
                                })
                                checked = checked.concat(item);
                        })
                        return checkedStack = checked, checked;
                },

                checkedLen: function(){
                        return checkedStack.length;
                },

                isFirstItem: function(item, type){
                    var index = modalStack[type].topic.indexOf(item);
                    return (index > -1 && index == 0);
                },

                isLastItem: function(item, type){
                    var index = modalStack[type].topic.indexOf(item);
                    return (index > -1 && index == modalStack[type].topic.length - 1);
                }
        }
        return stack;
}])
