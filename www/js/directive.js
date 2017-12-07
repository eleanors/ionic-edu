angular.module('starter.directive', [])
.directive('hideTabs', function($rootScope, $timeout) {
    return {
        restrict: 'A',
        link: function(scope, element, attributes) {

            scope.$on('$ionicView.beforeEnter', function() {

                scope.$watch(attributes.hideTabs, function(value) {
                    //console.log(attributes.hideTabs);
                    $rootScope.hideTabs = 'tabs-item-hide';
                });
            });

            scope.$on('$ionicView.beforeLeave', function() {
                scope.$watch(attributes.hideTabs, function(value) {
                    $rootScope.hideTabs = 'tabs-item-hide';
                });
                scope.$watch('$destroy', function() {
                    $rootScope.hideTabs = false;
                })

            });
        }
    };
})

.directive('scrollHeight', function($window) {
    return {
        restrict: 'AE',
        link: function(scope, element, attr) {
            var offset = ionic.Platform.isAndroid() ? 70 : 64;
            element[0].style.height = ($window.innerHeight - attr.scrollHeight - offset) + 'px';
        }
    };
})


.directive('draggable', function($ionicGesture,$window) {
    return {
        restrict: 'AE',
        link: function(scope, element, attr) {
            var ox,oy;
            $ionicGesture.on('drag',function($event){
                var el = $event.target,
                    dx = $event.gesture.deltaX,
                    dy = $event.gesture.deltaY;
                    el.style.left = ox + dx + "px";
                    el.style.top = oy + dy + "px";
            },element);
            $ionicGesture.on('touch',function($event){
                ox = $event.target.offsetLeft;
                oy = $event.target.offsetTop;
            },element);
            $ionicGesture.on('dragend',function($event){
                ox = $event.target.offsetLeft;
                oy = $event.target.offsetTop;
                console.log($window.innerHeight);
                console.log(oy,$window.innerHeight - 60);
                if(ox > document.body.offsetWidth - 60){
                    $event.target.style.left = document.body.offsetWidth - 80 + 'px';
                }
                if(oy > $window.innerHeight - 100){
                    $event.target.style.left = $window.innerHeight - 100 + 'px';
                }
                if(ox < 0){
                    $event.target.style.left = '20px';
                }
                if(oy < 0){
                    $event.target.style.top = '20px';
                }
            },element);
        }
    };
})

.directive('overflowHide', function($window) {
    return {
        restrict: 'AE',
        scope: {
            overflowHide:'=',
        },
        link: function(scope, element, attr) {
            var i = 1;
            var s = setInterval(function(){
                if(i > 30){
                    clearInterval(s);
                }
                i++;
                var height = element[0].offsetHeight;
                if(height > 200){
                    scope.overflowHide.hide = true;
                    element.css('height','200px');
                    clearInterval(s);
                    scope.$apply();
                }
            },100);
        }
    };
})


.directive('minScrollHeight', function($window) {
    return {
        restrict: 'AE',
        link: function(scope, element, attr) {
            var offset = ionic.Platform.isAndroid() ? 70 : 64;
            element[0].style.minHeight = ($window.innerHeight - attr.minScrollHeight - offset) + 'px';
        }
    };
})


.directive('loginViewTranslate', function($rootScope, $ionicPlatform, $timeout, $ionicHistory, $cordovaKeyboard) {
    return {
        restrict: 'A',
        link: function(scope, element, attributes) {
            window.addEventListener('native.keyboardshow', function(e) {
                angular.element(element).css({
                    'top': '10%'
                });
            });
            window.addEventListener('native.keyboardhide', function(e) {
                angular.element(element).css({
                    'top': '20%'
                });
                cordova.plugins.Keyboard.isVisible = true;
                $timeout(function() {
                    cordova.plugins.Keyboard.isVisible = false;
                }, 100);
            });
        }
    };
})


.directive('focusInput', function($window, $ionicPlatform, $timeout, $ionicHistory, $cordovaKeyboard) {
    return {
        restrict: 'A',
        link: function(scope, element, attributes) {
            var popup = angular.element(element).parent().parent();
            var winHeight = $window.innerHeight;
            popup.css({
                top: '0',
                position: 'relative',
                transition: 'all .2s ease .2s'
            });
            element.on('focus', function() {
                window.addEventListener('native.keyboardshow', function(e) {
                    var top = (winHeight - e.keyboardHeight - 160) / 2;
                    popup.css({
                        top: -top + 'px',
                    });
                });
                window.addEventListener('native.keyboardhide', function(e) {
                    popup.css({
                        top: '0'
                    });
                    cordova.plugins.Keyboard.isVisible = true;
                    $timeout(function() {
                        cordova.plugins.Keyboard.isVisible = false;
                    }, 100);
                });
            })
        }
    };
})


.directive('mathPreview', ['Public', function(Public) {
    return {
        restrict: 'A',
        replace: true,
        link: function(scope, element, attrs) {
            MathJax.Hub.Config({
                showProcessingMessages: false,
                messageStyle: 'none',
                jax: ['input/TeX', 'output/HTML-CSS'],
                extensions: ['tex2jax.js'],
                tex2jax: {
                    inlineMath: [['$', '$'],['\\(', '\\)']],
                    processEscapes: true
                },
                'HTML-CSS': {
                    linebreaks: { automatic: true, width: '90% container' },
                    availableFonts: ['TeX'],
                    processEscapes: true,
                    showMathMenu: false,
                    styles: {
                        '.MJXc-display': {
                            display: 'inline-block',
                            width: 'initial',
                            margin: '0 0',
                            padding: '10px 0 0',
                            'vertical-align': 'middle'
                        }
                    }
                },
                displayAlign: 'left'
            });
            var unwatch = scope.$watch(attrs.mathPreview, function(html) {
                if (html === null || html === undefined) return;
                html = html.replace(/\$\$([^$]+)\$\$/g, "<span class=\"red\"><script type='math/tex'>$1</script></span>");
                // html = html.replace(/\$([^$]+)\$/g, "<span class=\"red\"><script type='math/tex'>$1</script></span>");
                html = html.replace(/\$([^$]+)\$/g, "<span class=\"red\"><script type='math/tex'>\$1</script></span>");
                html = html.replace(/&nbsp;/g, " ").replace(/\<br\/\>/g, '')
                var arrEntities = { 'lt': '<', 'gt': '>', 'nbsp': ' ', 'amp': '&', 'quot': '"'};
                html = html.replace(/&(lt|gt|nbsp|amp|quot);/ig, function(all, t) { return arrEntities[t]; });
                element.html(html);
                MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
            });
            scope.$on('$destroy', unwatch);
        }
    };
}])


.directive('viewPicture', ['$rootScope', 'PhotoSwipe', '$window', function($rootScope, PhotoSwipe, $window){
    return {
        restruct: 'A',
        link: function(scope, elem, attr){
            var view = $window.innerWidth
            elem.off().on('click', function(evt){

                if(evt.target.nodeName.toLowerCase() == 'img'){
                    var img = new Image();
                    img.src = evt.target.src;
                    img.onload=function(){
                        var rw = this.width;
                        var rh = this.height;
                        if(rw >= view){
                            $rootScope.showImgBox = true;
                            PhotoSwipe.show([evt.target.src], 1, scope);
                        }
                        img = null;
                    }
                    //console.log(evt.target.src, $window)
                }
            })
        }
    }
}])


.directive('imgLoad', [function(){
    return {
        restrict: 'A',
        link: function(scope, elem, attr){
            attr.$observe('ngSrc', function(){

                elem.on('load', function(){
                    elem.prop('loaded', true);
                    elem.off('load error');
                })

                elem.on('error', function(){
                    // elem.prop('src', url);
                    elem.prop('loaded', false);
                })
            })
        }
    }
}])


.directive('contentLoadStatus', ['$ionicBind', '$compile', '$timeout',function($ionicBind, $compile, $timeout){
    return {
        restrict: 'A',
        scope: {
            showReloadBtn: '@',
            reloadType: '@',
            contentLoadStatus: '=',
            reloadViewHandler: '&'
        },
        link: function(scope, element, attr){

            var statusText = ['', '加载失败, 点击重新加载', '加载失败, 下拉重新加载'];

            var view = angular.element('<div><img src="img/load-error.png"><p class="error-text" ng-bind="statusText"></p></div>');
            view.addClass('content-load-error');
            var btn = angular.element('<span class="reload-btn" flash>重新加载</span>');

            scope.showReloadBtn = scope.$eval(scope.showReloadBtn);

            scope.statusText = statusText[scope.reloadType || 0];

            scope.reloadViewHandler = ionic.debounce(scope.reloadViewHandler, 1e3, true);

            if(scope.showReloadBtn) view.append(btn);

            scope.$watch('contentLoadStatus', function(value){
                if(value == undefined) return;
                if(value){
                    var childScope = scope.$new();
                    element.append($compile(view)(childScope));
                    element.find('span').off().on('click', function(){
                        scope.reloadViewHandler();
                    })
                }else{
                    view.remove();
                }
            })

            scope.$on('$destroy', function(){});
        }
    }
}])


.directive('photoSwipe', ['Public', '$rootScope', '$timeout', '$ionicPlatform', function(Public, $rootScope, $timeout, $ionicPlatform){
    return {
        restrict: 'AE',
        replace: true,
        link: function(scope, element, attrs){

            $rootScope.showImgBox = true;
            var swipeWrap = document.querySelectorAll('.pswp')[0];
            var pictureLen = scope.pictures.length;

            var options = {
                history: false,
                focus: false,
                loop: false,
                tapToClose: true,
                showAnimationDuration: 0,
                hideAnimationDuration: 0,
                showHideOpacity: true
            };

            scope.preload(scope.pictures,function(data){
                if(angular.isArray(data) && data.length) {
                    var deregister = null;
                    data = data.sort(function(a,b){return a.index-b.index});
                    $rootScope.gallery = new PhotoSwipe(swipeWrap, PhotoSwipeUI_Default, data, options);

                    $rootScope.gallery.listen('gettingData', function(index, item){});
                    $rootScope.gallery.listen('close', function() {
                            element.remove();
                            deregister && deregister();
                            $rootScope.showImgBox = false;
                    });
                    $rootScope.gallery.init();
                    $rootScope.gallery.goTo(scope.index);

                    var deregister = $ionicPlatform.registerBackButtonAction(function(e) {
                            $rootScope.gallery.close();
                    }, 120);
                }
            })

            scope.$on('$destroy', function(){
                element.remove();
            })
        },
        templateUrl: 'templates/public/comImageBox.html'
    }
}])


.directive('onlyNumber', [function(){
    return {
        restrict: 'A',
        require: '?ngModel',
        link: function(scope, element, attr, ctrl){
            scope.$watch(attr.ngModel, function(nv, ov){
                var selectionStart = element[0].selectionStart;

                var pattern  = /^[0-9]*$/g;
                if(nv == '') return ;
                if(!angular.isUndefined(nv) && !pattern.test(nv)){
                    nv = nv.toString().replace(/[^\d]/g, '');
                }

                // nv 值为空时 密码/注册页会自动聚焦    登录页非数字时也会被写入
                if(!angular.isUndefined(nv)){ //console.log(nv)

                    element[0].value = nv;
                    ctrl.$setViewValue(nv);
                    element[0].selectionStart = element[0].selectionEnd = selectionStart;
                }
            })
        }
    }
}])


.directive('searchClass', function(){
    return {
        restrict: 'A',
        require: '?ngModel',
        link: function(scope, elem, attr, ctrl){
            scope.$watch(attr.ngModel, function(nv, ov){
                if(nv !== '' && typeof nv !== 'undefined'){
                    if(nv.toString().length==6){
                        scope.search();
                    }
                }
            })
        }
    }
})


.directive('niceVideo', ['$sce', function($sce){
    return {
        restrict: 'AE',
        template: '<video width="100%" height="100%" class="video-js vjs-default-skin vjs-big-play-centered">'+
        '<source ng-src="{{videoUrl | trusted}}" type="video/mp4">'+
        '</video>',
        scope: {
            videoUrl: '=?'
        },
        replace: true,
        link: function(scope, elem, attr){

            console.log(scope.videoUrl)
            elem.find('source')[0].src = scope.videoUrl
            var options = {
                controls: true,
                autoplay: false,
                preload: true
            }
            var player = videojs(elem[0], options, function(){
                this.on('play',function(){
                    console.log('playing');
                });

                //暂停--播放完毕后也会暂停
                this.on('pause',function(){
                    console.log("pause")
                });

                // 结束
                this.on('ended', function() {
                    console.log('end');
                })
            });

            scope.$watch('videoUrl', function(nv, ov){

            })
        }
    }
}])


.directive('circleBubble', ['$timeout', function($timeout){
    return {
        restrict: 'AE',
        scope: {
            persent: '=',
            title: '@',
            duration: '=',
            radius: '=',
            waterColor: '=',
            lineWidth: '='
        },
        template: '<div class="circle"><div class="gradient">'+
        '<div class="circle-semi-a" style="height:{{100-value}}%"></div>'+
        '<div class="circle-semi-b" style="height:{{value}}%"></div></div>'+
        '<div class="circle-text">{{value}}%</div>'+
        '</div><div class="circle-title" ng-bind="title"></div>',
        replace: false,
        link: function (scope, element, attr) {

            scope.$watch('persent', function(nv, ov){
                var isIncrease, steps, stepDuration, delta = 1, duration=1000;
                scope.value = 0
                if(ov == undefined) ov =0;
                if(nv && nv !== ov){

                    nv = Math.round(nv), ov = Math.round(ov);
                    isIncrease = nv > ov;

                    delta += nv % 1;
                    steps = Math.floor(Math.abs(nv - ov) / delta);
                    stepDuration = duration / steps;

                    var requestAnimFrame = window.requestAnimationFrame ||
                        window.webkitRequestAnimationFrame || function (callback) {
                            setTimeout(callback, 1000 / 60);
                        }
                    //return scope.value = nv;
                    function animate(last){
                        if(isIncrease) {
                            ov += delta;
                        }else{
                            ov -= delta;
                        }

                        if ((isIncrease && ov >= nv) || (!isIncrease && ov <= nv)) {
                            requestAnimFrame(function () {

                                scope.$apply(function(){
                                    scope.value =  Math.round(nv);
                                });
                            });
                            return;
                        }

                        requestAnimFrame(function () {
                            scope.$apply(function(){
                                scope.value = Math.round(ov);
                            });
                        });

                        var now = Date.now(),
                            deltaTime = now - last;

                        if (deltaTime >= stepDuration) {
                            animate(now);
                        } else {
                            setTimeout(function () {
                                animate(Date.now());
                            }, stepDuration - deltaTime);
                        }
                    }
                    animate(Date.now());
                }
            })

            scope.$on('$destroy', function(){
                scope.$destroy();
                element.remove();
            })
        }
    }
}])


.directive('clearInput', ['$timeout', function($timeout) {
    return {
        restrict: 'A',
        require: '?ngModel',
        link: function(scope, element, attr, ctrl) {
            var hidden = 'hidden';
            var position = [];
            var clear = angular.element('<span class="clear-text ion-ios-close-empty"></span>');
            element.after(clear);
            clear.off().on('click', function(event) {
                element.on('blur', function() {
                    element[0].focus();
                });
                element[0].value = '';
                $timeout(function(){
                    element[0].focus();
                    element.off('blur')
                    .on('blur', function(){
                        clear.css('display', 'none');
                    });
                },200);
                ctrl.$setViewValue('');
                event.preventDefault();
            });
            if(attr.clearInput){
                position = attr.clearInput.split(',');
                clear.css({
                    top: position[0] + 'px',
                    right: position[1] + 'px'
                })
            }
            clear.css('display', 'none')

            scope.$watch(attr.ngModel, function(nv, ov) {
                if(!angular.isUndefined(nv) && nv!=''){
                    clear.css('display', 'block');
                }else{
                    clear.css('display', 'none');
                }
            })

            element.on('focus', function(){
                if(element.val() == '') return;
                clear.css('display', 'block');
            })

            element.on('blur', function(){
                clear.css('display', 'none');
            })
        }
    }
}])


.directive('customPicker', [function(){
    return {
        restrict: 'AE',
        replace: true,
        scope: true,
        transclude: true,
        link: function(scope, element, attrs){
            var backdropHandle = function(evt){
                if(evt.target == element[0]){
                    scope.cancel();
                    scope.$apply();
                }
            }
            scope.$on('$destroy', function(){
                element.remove();
            })

            element.bind('click', backdropHandle)
        },
        template: '<div class="custom-picker-backdrop"><div class="custom-picker-wrapper share-wrap">'+
        '<p class="title" ng-bind="titleText"></p>'+
        '<div class="custom-picker-content share-list">'+
                '<p ng-repeat="b in buttons" ng-click="buttonClicked($index)" ng-bind-html="b.text"></p>'+
        '</div>'+
        '</div></div>'
    }
}])


.directive('topicOptionList', ['imageLoaded', function(imageLoaded){
        return {
            restrict: 'A',
            scope: {
                className: '=',
                topicOptionList: '='
            },
            template: '<div class="option" ng-repeat="item in options">'+
                            '<span class="option-name">{{item.name}}</span>'+
                            '<div class="option-content" ng-bind-html="item.vaule | pictureLoadComplete"></div>'+
                       '</div>',
            link: function(scope, element, attr){
                var name = ['A', 'B', 'C', 'D', 'E', 'F'];
                scope.options = [];
                angular.forEach(name, function(value, index){
                    var option = scope.topicOptionList['options_'+name[index].toLowerCase()];
                    if(option){
                        scope.options.push({
                            name: name[index],
                            vaule: option
                        })
                    }
                })
            }
        }
}])
