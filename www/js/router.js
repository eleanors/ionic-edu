angular.module('starter.route', ['ionic'])
    .config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider, Config) {
        $ionicConfigProvider.platform.ios.tabs.style('standard');
        $ionicConfigProvider.platform.ios.tabs.position('bottom');
        $ionicConfigProvider.platform.android.tabs.style('standard');
        $ionicConfigProvider.platform.android.tabs.position('standard');

        $ionicConfigProvider.platform.ios.navBar.alignTitle('center');
        $ionicConfigProvider.platform.android.navBar.alignTitle('center');

        $ionicConfigProvider.platform.ios.backButton.previousTitleText(false).icon('ion-ios-arrow-thin-left');
        $ionicConfigProvider.platform.android.backButton.previousTitleText(false).icon('ion-android-arrow-back');

        $ionicConfigProvider.platform.ios.views.transition('ios');
        $ionicConfigProvider.platform.android.views.transition('android');
        $ionicConfigProvider.backButton.previousTitleText(false).icon('ion-ios-arrow-left');
        // $ionicConfigProvider.scrolling.jsScrolling(false);
        $ionicConfigProvider.views.swipeBackEnabled(false);

        // $ionicConfigProvider.backButton.icon('ion-ios-arrow-left');

        $ionicConfigProvider.views.maxCache(0);
        $ionicConfigProvider.templates.maxPrefetch(0);
        $stateProvider

            .state('main', {
                url: '/main',
                abstract: true,
                templateUrl: 'templates/index/tabs.html'
            })

            .state('main.grade', {
                url: '/grade',
                views: {
                    'tab-grade': {
                        templateUrl: 'templates/index/tab-grade.html',
                        controller: 'CourseController'
                    }
                }
            })

            .state('main.account', {
                url: '/account',
                views: {
                    'tab-account': {
                        templateUrl: 'templates/index/tab-account.html',
                        controller: 'AccountController'
                    }
                }
            })

            .state('main.errbook', {
                url: '/errbook',
                views: {
                    'tab-errbook': {
                        templateUrl: 'templates/errbook/tab-errbook.html',
                        controller: 'ErrbookController'
                    }
                }
            })

            .state('main.attend', {
                url: '/attend',
                views: {
                    'tab-grade': {
                        templateUrl: 'templates/index/grade-attend.html',
                        controller: 'AttendController'
                    }
                }
            })

            .state('main.courseDetailDaily', {
                url: '/daily/:class_number',
                views: {
                    'tab-grade': {
                        templateUrl: 'templates/grade/grade-detail-daily.html',
                        controller: 'CourseDetailDailyController'
                    }
                }
            })

            .state('main.courseDetailLive', {
                url: '/live/:class_number',
                views: {
                    'tab-grade': {
                        templateUrl: 'templates/grade/grade-detail-live.html',
                        controller: 'CourseDetailLiveController'
                    }
                }
            })

            .state('main.courseDetailLiveList', {
                url: '/livelist/:group_id&:school_id&:course_id',
                views: {
                    'tab-grade': {
                        templateUrl: 'templates/grade/grade-detail-live-list.html',
                        controller: 'CourseDetailLiveListController'
                    }
                }
            })

            .state('main.courseDetailDailySetting', {
                url: '/grade-setting/:class_number',
                views: {
                    'tab-grade': {
                        templateUrl: 'templates/grade/grade-detail-daily-setting.html',
                        controller: 'CourseDailySettingontroller'
                    }
                }
            })

            .state('main.courseDetailDailyEvalution', {
                url: '/class-evalution/:class_number',
                views: {
                    'tab-grade': {
                        templateUrl: 'templates/grade/grade-detail-daily-evalution.html',
                        controller: 'DailyEvalutionController'
                    }
                }
            })

            .state('main.courseDetailLiveEvalution', {
                url: '/course-evalution/:course_id',
                views: {
                    'tab-grade': {
                        templateUrl: 'templates/grade/grade-detail-live-evalution.html',
                        controller: 'LiveEvalutionController'
                    }
                }
            })

            .state('main.setting', {
                url: '/setting',
                views: {
                    'tab-account': {
                        templateUrl: 'templates/account/setting.html',
                        controller: 'SettingController'
                    }
                }
            })

            .state('main.feedback', {
                url: '/feedback',
                views: {
                    'tab-account': {
                        templateUrl: 'templates/account/feedback.html',
                        controller: 'FeedbackController'
                    }
                }
            })

            .state('main.modifypwd', {
                url: '/modifypwd',
                views: {
                    'tab-account': {
                        templateUrl: 'templates/account/modifypwd.html',
                        controller: 'ModifypwdController'
                    }
                }
            })

            .state('main.promises', {
                url: '/promises',
                views: {
                    'tab-account': {
                        templateUrl: 'templates/account/promises.html',
                        controller: 'PromisesController'
                    }
                }
            })

            .state('main.avatar', {
                url: '/avatar',
                views: {
                    'tab-account': {
                        templateUrl: 'templates/account/cropper.html',
                        controller: 'AvatarController'
                    }
                }
            })

            .state('login', {
                url: '/login',
                templateUrl: 'templates/login/login.html',
                controller: 'LoginController'
            })

            .state('register', {
                url: '/register',
                templateUrl: 'templates/login/register.html',
                controller: 'RegisterController'
            })

            .state('registers', {
                url: '/registers',
                templateUrl: 'templates/login/registers.html',
                controller: 'RegistersController'
            })

            .state('forget', {
                url: '/forget',
                templateUrl: 'templates/login/forget.html',
                controller: 'ForgetPwdController'
            })

            .state('main.task', {
                url: '/task/:id',
                views: {
                    'tab-grade': {
                        templateUrl: 'templates/task/index.html',
                        controller: 'TaskIndexController'
                    }
                }
            })

            .state('main.task-start', {
                url: '/task-start/:id',
                views: {
                    'tab-grade': {
                        templateUrl: 'templates/task/start.html',
                        controller: 'TaskStartController'
                    }
                }
            })

            .state('main.task-info', {
                url: '/task-info/:id',
                views: {
                    'tab-grade': {
                        templateUrl: 'templates/task/info.html',
                        controller: 'TaskInfoController'
                    }
                }
            })

            .state('main.info-details', {
                url: '/task-info-details/:id&:number',
                params: {
                    number: 0
                },
                views: {
                    'tab-grade': {
                        templateUrl: 'templates/task/info-details.html',
                        controller: 'TaskInfoDetailsController'
                    }
                }
            })
            .state('main.errbook-list', {
                url: '/errbook-list/:id',
                views: {
                    'tab-errbook': {
                        templateUrl: 'templates/errbook/errbookList.html',
                        controller: 'ErrbookListController'
                    }
                }
            })
            .state('main.errbook-items', {
                url: '/errbook-items/:subject_id&:lore_id&:months',
                views: {
                    'tab-errbook': {
                        templateUrl: 'templates/errbook/errbookItems.html',
                        controller: 'ErrbookItemsController'
                    }
                }
            })
            .state('main.errbook-items-info', {
                url: '/errbook-items-info/:subject_id&:lore_id&:test_id',
                views: {
                    'tab-errbook': {
                        templateUrl: 'templates/errbook/errbookItemsInfo.html',
                        controller: 'ErrbookItemsInfoController'
                    }
                }
            })

            .state('main.errbook-mark', {
                url: '/errbook-mark',
                views: {
                    'tab-errbook': {
                        templateUrl: 'templates/errbook/errbookMark.html',
                        controller: 'ErrbookMarkController'
                    }
                }
            });

            $urlRouterProvider.otherwise('/login');
    });
