angular.module('starter.services')

.factory('Request', ['$q', 'Reference', 'AuthService', 'Config', '$http', function($q, Reference, AuthService, Config, $http) {
        var api = Config.api;
        return {
                login: function(data) {
                        var defer = $q.defer();
                        Reference.post({
                                url: api.login,
                                params: data
                        })
                        .then(function(data) {
                                AuthService.setAuthInfo(data);
                                defer.resolve(data);
                        });
                        return defer.promise;
                },

                register: function(data) {
                        var defer = $q.defer();
                        Reference.post({
                                url: api.register,
                                params: data
                        })
                        .then(function(data) {
                                defer.resolve(data);
                        });
                        return defer.promise;
                },

                checkMobile: function(data) {
                        var defer = $q.defer();
                        Reference.post({
                                url: api.checkMobile,
                                params: data
                        })
                        .then(function(data) {
                                defer.resolve(data);
                        });
                        return defer.promise;
                },


                sendMobileCaptcha: function(data) {
                        return Reference.post({
                                url: api.sendCode,
                                params: data
                        })
                        .then(function(data) {
                                return data
                        })
                },

                updateUserInfo: function(data) {
                        var defer = $q.defer();
                        Reference.post({
                                url: api.modifyInfo,
                                params: data
                        })
                        .then(function(data) {
                                defer.resolve(data);
                                AuthService.updateAuthInfo(data);
                        }, function(){
                                defer.reject(data);
                        });
                        return defer.promise;
                },

                updatePwd: function(data) {
                        Reference.post({
                                url: api.updatePwd,
                                params: data
                        })
                        .then(function(data) {
                                return data
                        })
                },

                resetPwd: function(data) {
                        var defer = $q.defer();
                        Reference.post({
                                url: api.resetPwd,
                                params: data
                        })
                        .then(function(data) {
                                defer.resolve(data);
                        });
                        return defer.promise;
                },

                modifyPwd: function(data) {
                        var defer = $q.defer();
                        Reference.post({
                                url: api.modifyPwd,
                                params: data
                        })
                        .then(function(data) {
                                defer.resolve(data);
                        });
                        return defer.promise;
                },

                userInfo: function() {
                        var defer = $q.defer();
                        Reference.get({
                                url: api.userInfo,
                                params: {}
                        })
                        .then(function(data) {
                                defer.resolve(data);
                        });
                        return defer.promise;
                },

                feedback: function(data) {
                        var defer = $q.defer();
                        Reference.post({
                                url: api.feedback,
                                params: data
                        })
                        .then(function(data) {
                                defer.resolve(data);
                        }, function(data) {
                                defer.reject(data);
                        });
                        return defer.promise;
                },


                searchClass: function(data) {
                        var defer = $q.defer();
                        Reference.get({
                                url: api.searchClass,
                                params: data
                        })
                        .then(function(data) {
                                defer.resolve(data);
                        }, function(data) {
                                defer.reject(data);
                        });
                        return defer.promise;
                },

                attendClass: function(data) {
                        var defer = $q.defer();
                        Reference.post({
                                url: api.attendClass,
                                params: data
                        })
                        .then(function(data) {
                                defer.resolve(data);
                        });
                        return defer.promise;
                },

                attendedClass: function(data) {
                        var defer = $q.defer();
                        Reference.get({
                                url: api.attendedClass,
                                params: data || {}
                        })
                        .then(function(data) {
                                defer.resolve(data);
                        }, function(data){
                                defer.reject(data);
                        });
                        return defer.promise;
                },


                quitClass: function(data) {
                        var defer = $q.defer();
                        Reference.post({
                                url: api.quitClass,
                                params: data
                        })
                        .then(function(data) {
                                defer.resolve(data);
                        });
                        return defer.promise;
                },

                dailyClassDetail: function(data) {
                        var defer = $q.defer();
                        Reference.get({
                                url: api.dailyClassDetail,
                                params: data
                        })
                        .then(function(data) {
                                defer.resolve(data);
                        }, function(data) {
                                defer.reject(data);
                        });
                        return defer.promise;
                },

                liveClassDetail: function(data) {
                        var defer = $q.defer();
                        Reference.get({
                                url: api.liveClassDetail,
                                params: data
                        })
                        .then(function(data) {
                                defer.resolve(data);
                        }, function(data) {
                                defer.reject(data);
                        });
                        return defer.promise;
                },


                liveClassListDetail: function(data) {
                        var defer = $q.defer();
                        Reference.get({
                                url: api.liveClassListDetail,
                                params: data
                        })
                        .then(function(data) {
                                defer.resolve(data);
                        }, function(data) {
                                defer.reject(data);
                        });
                        return defer.promise;
                },

                Task: function(data) {

                        var defer = $q.defer();
                        Reference.get({
                                url: api.Task,
                                params: data
                        })
                        .then(function(data) {
                                defer.resolve(data.data);
                        }, function(data) {
                                defer.reject(data);
                        });
                        return defer.promise;
                },

                StartTask: function(data) {

                        var defer = $q.defer();
                        Reference.get({
                                url: api.StartTask,
                                params: data
                        })
                        .then(function(data) {
                                defer.resolve(data.data);
                        });
                        return defer.promise;
                },

                AnswerList: function(data) {

                        var defer = $q.defer();
                        Reference.get({
                                url: api.AnswerList,
                                params: data
                        })
                        .then(function(data) {
                                defer.resolve(data.data);
                        }, function(data) {
                                defer.reject(data);
                        });
                        return defer.promise;
                },

                TaskDetail: function(data) {

                        var defer = $q.defer();
                        Reference.get({
                                url: api.TaskDetail,
                                params: data
                        })
                        .then(function(data) {
                                defer.resolve(data.data);
                        }, function(data) {
                                defer.reject(data);
                        });
                        return defer.promise;
                },

                DoTask: function(data) {

                        var defer = $q.defer();
                        Reference.post({
                                url: api.DoTask,
                                params: data
                        })
                        .then(function(data) {
                                defer.resolve(data);
                        }, function(data) {
                                defer.reject(data);
                        });
                        return defer.promise;
                },
                SubmitTask: function(data) {

                        var defer = $q.defer();
                        Reference.post({
                                url: api.SubmitTask,
                                params: data
                        })
                        .then(function(data) {
                                defer.resolve(data);
                        });
                        return defer.promise;
                },

                classReport: function(data) {

                        var defer = $q.defer();
                        Reference.get({
                                url: api.classReport,
                                params: data
                        })
                        .then(function(data) {
                                defer.resolve(data);
                        }, function(data){
                                defer.reject(data);
                        });
                        return defer.promise;
                },

                courseReport: function(data) {

                        var defer = $q.defer();
                        Reference.get({
                                url: api.courseReport,
                                params: data
                        })
                        .then(function(data) {
                                defer.resolve(data);
                        }, function(data){
                                defer.reject(data);
                        });
                        return defer.promise;
                },

                UploadImgBase64: function(data) {

                        var defer = $q.defer();
                        Reference.post({
                                url: api.UploadImgBase64,
                                params: data
                        })
                        .then(function(data) {
                                defer.resolve(data.data);
                        },function(data) {
                                defer.reject(data);
                        });
                        return defer.promise;
                },
                Version: function(data) {
                        var defer = $q.defer();
                        //
                        Reference.post({
                          url: api.Version,
                          params: data
                        })
                        .then(function(data) {
                          defer.resolve(data.data);
                        });
                        // if(Config.evn){
                        //         Reference.post({
                        //                 url: api.Version,
                        //                 params: data
                        //         })
                        //         .then(function(data) {
                        //               defer.resolve(data.data);
                        //         });
                        // }else{
                        //         $http.get(Config.testUpdateApi, {
                        //                 params: data
                        //         })
                        //         .then(function(data) {
                        //                 defer.resolve(data.data);
                        //         })
                        // }
                        return defer.promise;
                },

                getSubjectList: function(data) {

                    var defer = $q.defer();
                    Reference.get({
                        url: api.subjectList,
                        params: data
                    })
                    .then(function(data) {
                        defer.resolve(data.data);
                    },function(data) {
                        defer.reject(data);
                    });
                    return defer.promise;
                },

                getLoreList: function(data) {

                    var defer = $q.defer();
                    Reference.get({
                        url: api.loreList,
                        params: data
                    })
                    .then(function(data) {
                        defer.resolve(data.data);
                    },function(data) {
                        defer.reject(data);
                    });
                    return defer.promise;
                },

                getTestList: function(data) {

                    var defer = $q.defer();
                    var url = '';
                    if(data.lore_id == 0){
                        // delete data.lore_id;
                        url = api.testAllList;
                    }else{
                        url = api.testList;
                    }
                    Reference.get({
                        url: url,
                        params: data
                    })
                    .then(function(data) {
                        defer.resolve(data.data);
                    },function(data) {
                        defer.reject(data);
                    });
                    return defer.promise;
                },

                checkToken: function(data) {
                    var defer = $q.defer();
                    Reference.get({
                        url: api.checkToken,
                        params: data
                    })
                    .then(function(data) {
                        defer.resolve(data.data);
                    },function(data) {
                        defer.reject(data);
                    });
                    return defer.promise;
                },

                setGrasp: function(data) {
                    var defer = $q.defer();
                    Reference.get({
                        url: api.setGrasp,
                        params: data
                    })
                    .then(function(data) {
                        defer.resolve(data.data);
                    },function(data) {
                        defer.reject(data);
                    });
                    return defer.promise;
                },

                setPrint: function(data) {
                    var defer = $q.defer();
                    Reference.get({
                        url: api.setPrint,
                        params: data
                    })
                    .then(function(data) {
                        defer.resolve(data.data);
                    },function(data) {
                        defer.reject(data);
                    });
                    return defer.promise;
                },

                getPrintList: function() {
                    var defer = $q.defer();
                    Reference.get({
                        url: api.getPrintList,
                        params: {}
                    })
                    .then(function(data) {
                        defer.resolve(data.data);
                    },function(data) {
                        defer.reject(data);
                    });
                    return defer.promise;
                },

                printListSort: function(data) {
                    var defer = $q.defer();
                    Reference.post({
                        url: api.printListSort,
                        params: data
                    })
                    .then(function(data) {
                        defer.resolve(data);
                    },function(data) {
                        defer.reject(data);
                    });
                    return defer.promise;
                },

                printListDel: function(data) {
                    var defer = $q.defer();
                    Reference.post({
                        url: api.printListDel,
                        params: data
                    })
                    .then(function(data) {
                        defer.resolve(data);
                    },function(data) {
                        defer.reject(data);
                    });
                    return defer.promise;
                },

                printWrongTest: function(data) {
                    var defer = $q.defer();
                    Reference.post({
                        url: api.printWrongTest,
                        params: data
                    })
                    .then(function(data) {
                        defer.resolve(data);
                    },function(data) {
                        defer.reject(data);
                    });
                    return defer.promise;
                }
        };
}]);
