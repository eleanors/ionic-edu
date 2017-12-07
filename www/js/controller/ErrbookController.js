angular.module('starter.controllers')
.controller('ErrbookController', ['$scope', 'Request', '$localStorage', function($scope, Request, $localStorage) {
    // console.log(Request.getSubjectList());
    $scope.relation = {
        1: "yuwen",
        2: "shuxue",
        3: 'yingyu',
        4: "huaxue",
        5: "wuli",
        6: "", //shengwu
        7: "", //lishi
        8: "", //dili
        9: "", //zhengzhi
        10: "yuwen",
        11: "shuxue",
        12: "yingyu",
        13: "huaxue",
        14: "wuli",
        15: "", //shengwu
        16: "", //lishi
        17: "", //dili
        19: "", //kexue
        22: "", //xiaoshengchu
        23: "yuwen",
        24: "shuxue",
        25: "yingyu",
    };
    $localStorage.months = 0;
    $scope.list = [];
    $scope.initstatus = false;

    $scope.getList = function(op) {

        var promise = Request.getSubjectList({
            unloading: op ? true : false
        }).then(function(result) {

            for (var i in result) {
                var subject_id = result[i].subject_id;
                if ($scope.relation[subject_id] || $scope.relation[subject_id] == '') {
                    result[i].name = $scope.relation[subject_id];
                } else {
                    result[i].name = $scope.relation[1];
                }
            }
            $scope.list = result;
            $localStorage.subject_list = result;
            $scope.status = false;
            $scope.initstatus = true;
        }, function() {

            $scope.status = $scope.initstatus = true;
        });
        return promise;
    };
    $scope.getList();

    $scope.refreshHandle = function() {
        $scope.getList(true).finally(function() {
            $scope.$broadcast('scroll.refreshComplete');
        });
    };

}])


.controller('ErrbookListController', ['$scope', 'Request', '$stateParams', '$location', '$localStorage', '$ionicScrollDelegate', function($scope, Request, $stateParams, $location, $localStorage, $ionicScrollDelegate) {
    var subject_list = $localStorage.subject_list;
    $scope.id = $stateParams.id;
    $scope.option_name = '全部';


    $scope.months = ($localStorage.months) ? $localStorage.months : 0;

    switch ($scope.months) {
        case '0':
            $scope.option_name = '全部';
            break;
        case '1':
            $scope.option_name = '最近一月';
            break;
        case '3':
            $scope.option_name = '最近三月';
            break;
        case '6':
            $scope.option_name = '最近半年';
            break;
        case '12':
            $scope.option_name = '最近一年';
            break;
        default:
            $scope.option_name = '全部';
            break;
    }
    for (var i in subject_list) {
        if (subject_list[i].subject_id == $scope.id) {
            $scope.subject_name = subject_list[i].subject_name;
        }
    }
    $scope.open = function() {
        $scope.openoption = ($scope.openoption) ? false : true;
    };

    $scope.close = function() {
        $scope.openoption = false;
    };

    $scope.$watch('months', function() {
        $scope.openoption = false;
        Request.getLoreList({
            subject_id: $scope.id,
            months: $scope.months
        }).then(function(result) {
            if (!result || result.length <= 0) {
                $location.path('/errbook');
                return;
            }
            $scope.list = result;
            $localStorage.lore_list = result;
            $scope.counts = 0;
            for (var i in result) {
                $scope.counts += result[i].test_count;
            }
        });
    });

    $scope.options = function(num, name) {

        $scope.months = num;
        $scope.option_name = name;
        $ionicScrollDelegate.$getByHandle('mainScroll').scrollTop();
    };

}])


.controller('ErrbookItemsController', ['$scope', 'Request', '$stateParams', '$ionicModal', '$window', '$sce', 'PhotoSwipe', '$localStorage', '$ionicScrollDelegate', 'Public', 'imageLoaded', '$cordovaFileTransfer', function($scope, Request, $stateParams, $ionicModal, $window, $sce, PhotoSwipe, $localStorage, $ionicScrollDelegate, Public, imageLoaded, $cordovaFileTransfer) {

    $scope.subject_id = $stateParams.subject_id;
    $scope.lore_id = $stateParams.lore_id;
    $scope.months = $stateParams.months;
    $scope.lore_list = $localStorage.lore_list;
    $localStorage.months = $scope.months;

    for (var i in $scope.lore_list) {
        if ($scope.lore_list[i].lore_id == $scope.lore_id) {
            $scope.lore_name = $scope.lore_list[i].lore_name;
        }
    }
    console.log($scope.lore_name);
    if ($scope.lore_id == 0) {
        $scope.lore_name = '全部错题';
    }

    $scope.data = {};
    $scope.data = {
        subject_id: $scope.subject_id,
        lore_id: $scope.lore_id,
        test_type: 0, //题型
        test_difficulty_level: 0, //难度
        page: 1,
        months: $scope.months,
        is_grasp: 2,
        count: 5
    };
    $scope.typelist = {
        0: '全部题型',
        1: '单选题',
        2: '多选题',
        3: '解答题'
    };
    //掌握
    $scope.grasp_name = '全部';
    $scope.open = function(type) {
        if (type == 'type') {
            if ($scope.option_type === true) {
                $scope.option_type = false;
            } else {
                $scope.option_type = true;
            }
            $scope.option_diff = false;
            $scope.option_grasp = false;
        } else if (type == 'diff') {
            if ($scope.option_diff === true) {
                $scope.option_diff = false;
            } else {
                $scope.option_diff = true;
            }
            $scope.option_grasp = false;
            $scope.option_type = false;
        } else {
            if ($scope.option_grasp === true) {
                $scope.option_grasp = false;
            } else {
                $scope.option_grasp = true;
            }
            $scope.option_type = false;
            $scope.option_diff = false;
        }
    };

    $scope.close = function() {
        $scope.option_type = false;
        $scope.option_diff = false;
        $scope.option_grasp = false;
    };

    $scope.page_data = {};
    $scope.getList = function(type) {
        $scope.close();
        if (!type) {
            $scope.data.page = 1;
            $ionicScrollDelegate.$getByHandle('mainScroll').scrollTop(false);
        }
        var promise = Request.getTestList($scope.data).then(function(result) {
            if (type === true) {
                for (var i in result.test_list) {
                    $scope.list.push(result.test_list[i]);
                }
            } else {
                $scope.list = result.test_list;
            }
            $scope.page_data.status = false;
            $scope.test_count = result.test_count;
            $scope.page_data.has_next = result.has_next;

            // $scope.$destroy('list');
        }, function() {
            $scope.page_data.status = true;
        });
        return promise;
    };
    $scope.option_name = '全部难度';
    $scope.getList();
    $scope.check_diff = function(num, type) {
        $scope.data.test_difficulty_level = num;
        $scope.getList();
        $scope.option_name = type;
    };
    $scope.check_grasp = function(num, type) {
        $scope.data.is_grasp = num;
        $scope.getList();
        $scope.grasp_name = type;
    };

    //设置错题掌握
    $scope.setGrasp = function(item) {
        console.log($scope.list);
        var is_grasp = (item.is_grasp == 1) ? 0 : 1;
        Request.setGrasp({
            cloud_subject_id: item.cloud_subject_id,
            cloud_test_id: item.cloud_test_id,
            is_grasp: is_grasp
        }).then(function(result) {
            item.is_grasp = (item.is_grasp == 1) ? 0 : 1;
            for(var i in $scope.list){
                if(item.task_id == $scope.list[i].task_id){
                    $scope.list[i].is_grasp = item.is_grasp;
                }
            }
        });
    };
    //设置错题打印
    $scope.setPrint = function(item) {
        var is_print = (item.is_print == 1) ? 0 : 1;
        if (is_print == 1 && $scope.err_test_count >= 30) {
            Public.Toast('最多勾选30道，请删除部分题目后再试');
            return false;
        }
        Request.setPrint({
            cloud_subject_id: item.cloud_subject_id,
            cloud_test_id: item.cloud_test_id,
            is_print: is_print
        }).then(function(result) {
            if (item.is_print == 1) {
                item.is_print = 0;
                $scope.err_test_count--;
            } else {
                item.is_print = 1;
                $scope.err_test_count++;
            }
        });
    };
    //错误打印列表
    Request.getPrintList().then(function(result) {
        $scope.err_test_count = result.test_count;
    });
    $scope.check_type = function(num) {
        $scope.data.test_type = num;
        $scope.getList();
    };

    $scope.onscroll = function() {
        $scope.option_type = false;
        $scope.option_diff = false;
    };


    $scope.refreshHandle = function() {
        //delete $scope.list;
        $scope.getList(false).finally(function() {
            $scope.$broadcast('scroll.refreshComplete');
        });
    };
    $scope.loadMore = ionic.debounce(function() {
        $scope.data.page++;
        $ionicScrollDelegate.$getByHandle('mainScroll').scrollBottom(false);
        $scope.getList(true).finally(function() {
            $scope.$broadcast('scroll.infiniteScrollComplete');
        });
    }, 1e3, true);

    $scope.reloadMore = ionic.debounce(function() {
        // $scope.data.page--;
        $scope.data.status = false;
        $scope.getList(true).finally(function() {
            $scope.$broadcast('scroll.infiniteScrollComplete');
        });
    }, 1e3, true);

    $scope.showModal = function(item) {
        $ionicModal.fromTemplateUrl(
            'templates/errbook/errbookItemsInfo.html', {
                scope: $scope,
                animation: 'slide-right'
            }).then(function(modal) {
            $scope.modal = modal;
        });
        $scope.nowInfo = item;
        $scope.getTaskInfo(item).finally(function() {
            $scope.modal.show();
        });
    };


    var sortBy = function(attr, rev) {
        rev = rev ? -1 : 1;
        return function(a, b) {
            a = a[attr];
            b = b[attr];
            if (a < b) {
                return rev * -1;
            }
            if (a > b) {
                return rev * 1;
            }
            return 0;
        };
    };
    $scope.getTaskInfo = function(item) {
        var promise = Request.TaskDetail({
            task_id: item.task_id,
            test_number: item.test_number
        }).then(function(result) {
            result.content = result.cloud_data;
            $scope.x = result;

            if (result.content && angular.isArray(result.content.voice_list)) {
                $scope.x.content.voice_list = result.content.voice_list.sort(sortBy('type'));
            }
            Public.DefaultCheck($scope.x, result.cloud_data.student_answer);
            $scope.x = Public.replaceText($scope.x);

            if ($scope.x.content.video_url) {

                $scope.x.content.video = {};
                $scope.x.content.video.sources = [
                    { src: $sce.trustAsResourceUrl($scope.x.content.video_url), type: "video/mp4" },
                ];
                $scope.x.content.video.config = {
                    autoHide: true,
                    autoHideTime: 3000,
                    autoPlay: false,
                    sources: $scope.x.content.video.sources,
                    video_index: 0
                };
            }
        });
        return promise;
    };


    $scope.hideModal = function() {
        closeVideo();
        $scope.modal.remove();
        // $scope.modal.remove();
        setTimeout(function() {
            delete $scope.x;
        }, 500);
        //
    };
    $scope.refreshNow = function() {

        $scope.getTaskInfo($scope.nowInfo).finally(function() {
            $scope.$broadcast('scroll.refreshComplete');
        });
    };

    $scope.onPlayerReady = function(API) {

        $scope.API = API;

        API.mediaElement[0].addEventListener('play', function() {
            closeVoice();
        }, false);
    };

    function closeVideo() {
        if (!$scope.API) return;
        $scope.API.pause();
    }

    function closeVoice() {

        if (!ionic.Platform.isAndroid() && ionic.Platform.navigator.platform !== 'Win32') {
            recordAudio.stopAudio();
        }

        if ($scope.x && $scope.x.content && $scope.x.content.voice_list) {
            if ($scope.x.content.voice_list[0]) {

                for (var i in $scope.x.content.voice_list[0].voice) {
                    $scope.x.content.voice_list[0].voice[i].play = false;
                    if ($scope.x.content.voice_list[0].voice[i].media) {
                        $scope.x.content.voice_list[0].voice[i].media.stop();
                    }
                }
            }

            if ($scope.x.content.voice_list[1]) {

                for (var i in $scope.x.content.voice_list[1].voice) {
                    $scope.x.content.voice_list[1].voice[i].play = false;
                    if ($scope.x.content.voice_list[1].voice[i].media) {
                        $scope.x.content.voice_list[1].voice[i].media.stop();
                    }
                }
            }
        }
    }

    $scope.test = function() {
        $scope.play = ($scope.play) ? false : true;
    };

    //解答题图片预览
    $scope.previewPicture = function(num, item, event) {

        var elem = angular.element(event.target);
        if (item == '') return;
        if (elem.prop('loaded')) {
            PhotoSwipe.show($scope.x.check, num);
        } else {
            var image = new Image();
            angular.element(image).off().on('load', function() {
                $scope.x.check[num] = item;
                elem.prop('loaded', true);
                image = null;
            })
            image.src = item;
        }
    };

    //播放音频
    $scope.play = function(voice) {
        var voice_status = voice.play;
        if (ionic.Platform.isAndroid()) {
            voice.loading = true;
        }
        closeVideo();
        closeVoice();
        voice.play = (voice_status) ? false : true;
        if (voice.play === false) {
            voice.loading = false;
            play(voice, 'stop');
            return true;
        }
        if (voice.media) {
            play(voice, 'play');
            return true;
        }
        play(voice, 'play');
    };

    function play(voice, status) {
        //android
        if (ionic.Platform.isAndroid()) {

            if (voice.media) {
                if (status == 'play') {
                    voice.media.play();
                    return false;
                } else {
                    voice.media.stop();
                    return false;
                }
            } else {
                var mediaRec = new Media(voice.url,
                    function() {

                    },
                    function(error) {
                        if (error.code !== 0) {
                            // Public.Toast('语音播放失败');
                            voice.play = voice.loading = false;
                            $scope.$apply();
                        }
                    },
                    function(status) {
                        if (status > 1) {
                            voice.loading = false;
                        }
                        if (status === 4) {
                            voice.play = false;
                        }
                        $scope.$apply();
                    });
                voice.media = mediaRec;
                voice.media.play();
            }
        } else {
            if (status == 'play') {
                recordAudio.stopAudio();
                downloadamr(voice);
            } else {
                recordAudio.stopAudio();
            }
        }

    };

    function downloadamr(voice) {
        console.log('downloadamr', voice);
        var amrname = voice.url.split('/');
        amrname = amrname[amrname.length - 1];
        var targetPath = cordova.file.documentsDirectory + amrname; //APP下载存放的路径，可以使用cordova file插件进行相关配置
        var trustHosts = true;
        var options = {};

        voice.loading = true;
        $cordovaFileTransfer.download(voice.url, targetPath, options, trustHosts).then(function(result) {

            voice.loading = false;
            // FileTransfer
            recordAudio.convertToWav(targetPath, function(success) {
                console.log('downloadamr_(success):', success);
                voice.play = true;
                recordAudio.play(success.fullPath);
                $timeout(function() {
                    voice.play = false;
                    $scope.$apply();
                }, success.duration * 1000);
            });
            voice.targetPath = targetPath;
        }, function(err) {
            console.log('downloadamr_(err)', voice);
            voice.loading = false;
            voice.play = false;
        }, function(progress) {});
    }

}])


.controller('ErrbookMarkController', ['$scope', 'Request', 'MoveOrder', 'moveMsg', 'sharePicker', 'Public', function($scope, Request, MoveOrder, moveMsg, sharePicker, Public) {
    $scope.checkedItem = [];
    // 未选择  超过2个
    $scope.markData = [];
    /*[
         { topic: 1, checked: false, type: 0 },
         { topic: 2, checked: false, type: 1 }
     ]*/
    $scope.cateByType = function(modal) {
        var result = [];
        var topicIndex = 1;
        var groupBy = function(obj, fn) {
            var result = {};
            angular.forEach(obj, function(value, index) {
                var key = fn(value, index);
                (result[key] || (result[key] = [])).push(value);
            });
            return result;
        };

        modal = groupBy(modal, function(value, index) {
            return value.test_type;
        })

        angular.forEach(modal, function(value, index) {
            angular.forEach(value, function(item) {
                item.index = topicIndex++;
                item.type = parseInt(index);
                item.checked = true;
            })
            result[index] = {
                topic: value,
                test_type: parseInt(index),
                checked: true
            }
        })
        return result;
    }

    $scope.fetchPrintList = function(op) {
        var promise = Request.getPrintList({
            unloading: op ? true : false
        }).then(function(data) {
            if (data && data.test_list.length) {
                $scope.markData = $scope.cateByType(data.test_list);
                MoveOrder.addModal($scope.markData);
            }
            $scope.status = false;
        }, function(data) {
            $scope.status = true;
        })
        return promise;
    }

    $scope.refreshHandle = function() {
        $scope.fetchPrintList(true).finally(function() {
            $scope.$broadcast('scroll.refreshComplete');
        })
    }

    $scope.fetchPrintList();

    $scope.move = function(direction) {
        var checkedItem = MoveOrder.checkedItem();
        if (checkedItem.length == 1) {
            var item = checkedItem[0];
            var index = $scope.markData[item.type].topic.indexOf(item);
            if ($scope.isAllowDown && direction > 0) { // down
                var itmes = MoveOrder.prevMoveItem(item.type, index, index + 1);
                $scope.listSortHandler(itmes)
                .then(function() {
                    MoveOrder.moveItem(item.type, index, index + 1);
                }, function() {
                    Public.Toast(moveMsg.moveFailure);
                })
            } else if ($scope.isAllowUp && direction < 0) {
                var itmes = MoveOrder.prevMoveItem(item.type, index, index - 1);
                $scope.listSortHandler(itmes)
                .then(function() {
                    index > 0 && MoveOrder.moveItem(item.type, index, index - 1);
                }, function() {
                    Public.Toast(moveMsg.moveFailure);
                })
            }
        } else if (checkedItem.length == 0) {
            Public.Toast(moveMsg.makeSelect);
        } else {
            Public.Toast(moveMsg.moveByOne);
        }
    }

    $scope.select = function(item, type) {
        item.checked = !item.checked;
        $scope.checkedItem = MoveOrder.checkedItem();

        var items = $scope.checkedItem.filter(function(item) {
            return item.type == type;
        })

        if (items.length == $scope.markData[type].topic.length) {
            $scope.markData[type].checked = true;
        } else {
            $scope.markData[type].checked = false;
        }
    }

    $scope.selectAll = function(type) {

        $scope.markData[type].checked = !$scope.markData[type].checked;
        angular.forEach($scope.markData[type].topic, function(item) {
            item.checked = $scope.markData[type].checked ? true : false;
        })
        $scope.checkedItem = MoveOrder.checkedItem();
    }

    $scope.delete = function() {
        var checkeds = MoveOrder.checkedItem();

        if (checkeds.length == 0) {
            return Public.Toast(moveMsg.makeDelete);
        }
        Public.Modal({
            template: '确定要删除选中题目?',
            cssClass: 'complate-task',
            buttons: [{
                text: '确定'
            }, {
                text: '取消'
            }]
        }, function(result) {
            if (result) {
                $scope.listDelHandler(checkeds);
            }
        })
    }

    $scope.remain = function() {
        var remainCount = 0;
        angular.forEach($scope.markData, function(item) {
            remainCount += item.topic.length;
        })
        remainCount == 0 && ($scope.markData = []);
    }

    $scope.upDisabled = function() {

        var checkeds = MoveOrder.checkedItem();
        var item = checkeds[0];
        if (!item || checkeds.length !== 1 || MoveOrder.isFirstItem(item, item.type)) {
            $scope.isAllowUp = false;
            return 'disabled';
        } else {
            $scope.isAllowUp = true;
            return '';
        }
    }

    $scope.downDisabled = function() {
        var checkeds = MoveOrder.checkedItem();
        var item = checkeds[0];
        if (!item || checkeds.length !== 1 || MoveOrder.isLastItem(item, item.type)) {
            $scope.isAllowDown = false;
            return 'disabled';
        } else {
            $scope.isAllowDown = true;
            return '';
        }
    }

    $scope.printItems = function() {
        var checkeds = MoveOrder.checkedItem();
        if(checkeds.length == 0){
            return Public.Toast(moveMsg.makeShare);
        }

        sharePicker.show({
            titleText: '分享至',
            buttons: [
                { text: '<span class="share-qq"></span>QQ' },
                { text: '<span class="share-wechat"></span>微信好友' }
            ],
            buttonClicked: function(index) {
                $scope.printWrongTest(checkeds).then(function(result){
                    console.log(result)
                    if(index == 1){
                        Wechat.share({
                            message: {
                                title: result.data.share_title,
                                description: result.data.share_desc,
                                thumb: result.data.share_img,
                                mediaTagName: "TEST-TAG-001",
                                messageExt: "分享pdf",
                                messageAction: "<action>dotalist</action>",
                                media: {
                                    type: Wechat.Type.WEBPAGE,
                                    webpageUrl: result.data.pdf_url,
                                }
                            },
                            scene: Wechat.Scene.SESSION   // share to Timeline
                        }, function (res) {
                            $scope.listDelHandler(checkeds);
                        }, function (reason) {
                            console.log('error:',reason);
                        });
                    }else{
                        var args = {};
                        args.client = QQSDK.ClientType.QQ;//QQSDK.ClientType.QQ,QQSDK.ClientType.TIM;
                        args.scene = QQSDK.Scene.QQ;//QQSDK.Scene.QQZone,QQSDK.Scene.Favorite
                        args.url = result.data.pdf_url;
                        args.title = result.data.share_title;
                        args.description = result.data.share_desc;
                        args.image = result.data.share_img;
                        QQSDK.shareNews(function () {
                            $scope.listDelHandler(checkeds);
                        }, function (failReason) {
                            console.log('failReason',failReason);
                        }, args);
                    }
                });
                return true;
            }
        })
    }

    $scope.selectedCount = function() {
        var checkeds = MoveOrder.checkedItem();
        return checkeds.length;
    }

    $scope.listSortHandler = function(modal) {
        var result = [];
        angular.forEach(modal, function(items) {
            if (items == undefined) return
            angular.forEach(items.topic, function(topic) {
                result.push({
                    cloud_subject_id: topic.cloud_subject_id,
                    cloud_test_id: topic.cloud_test_id
                })
            })
        })
        return Request.printListSort({
            json_data: JSON.stringify(result)
        })
    }

    $scope.printWrongTest = function(modal) {
        var result = [];
        angular.forEach(modal, function(items) {
            result.push({
                cloud_subject_id: items.cloud_subject_id,
                cloud_test_id: items.cloud_test_id
            })
        })
        return Request.printWrongTest({
            json_data: JSON.stringify(result)
        })
    }

    $scope.listDelHandler = function(modal) {
        var result = [];
        angular.forEach(modal, function(items) {
            result.push({
                cloud_subject_id: items.cloud_subject_id,
                cloud_test_id: items.cloud_test_id
            })
        })
        Request.printListDel({
            json_data: JSON.stringify(result)
        })
        .then(function() {
            angular.forEach(modal, function(item) {
                MoveOrder.removeItem(item, item.type);
            })
            $scope.checkedItem = MoveOrder.checkedItem();
            $scope.remain();
        }, function() {
            Public.Toast(moveMsg.DelFailure);
        })
    }
}])


.constant('moveMsg', {
    moveByOne: '只可选中一道题排序',
    makeDelete: '请选择要删除的题目',
    makeSelect: '请选择要排序的题目',
    makeShare: '请选择要打印的题目',
    maxSelect: '最多勾选30道，请删除部分题目后再试',

    DelFailure: '删除失败了, 请重新尝试',
    moveFailure: '排序失败了, 请重新尝试'
})
