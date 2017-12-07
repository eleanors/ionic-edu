angular.module('starter.constant', [])

    .constant('Config', {
        host: 'http://api.cloudclass.qinxue100.com/',
        testHost: 'http://api.test.cloudclass.qinxue100.com/',
        evn: false, // true  正式环境,  false 测试环境
        version_code: '1.1.7.0',
        regExp: {
            isMobile: /^1[3|5|7|8]\d{9}|^147\d{8}$/,
            isMail: /^[\w.%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,6}$/,
            isPassword: /^[0-9a-zA-Z]{6,20}$/,
            isRuleChar: /^\w?(\w?[\u4e00-\u9fa5\w])+$/g
        },
        testUpdateApi: 'http://192.168.1.79:8090/update.json',
        umengAPPKEY: '591c40d199f0c74a84000709',

        //个推测试帐号
        getui_test: {
            AppId: 't2lMXIH7zQ84FUuaBVksq3',
            AppKey: 'qRhkvj3eIe5qLDzS4Le8F5',
            AppSecret: 'xBzogGfX9F7M2I9ARUMjb2',
        },
        //个推299(安卓和ios企业版用)
        getui: {
            AppId: '9k2fgeIKm56m5v1A9MP7L1',
            AppKey: 'tzFIHXCaO888lk0B1qK8D8',
            AppSecret: 'HQCOzlxtZT8kLLGIwykE41',
        },
        //个推99(APP STORE专用)
        getui99: {
            AppId: 'Zg9HDpAgYj5r1OdqRtuWc8',
            AppKey: 'bRvEAQOLE7AuKDS6Ierzy4',
            AppSecret: 'OJ93GuaEWa5X9TZeNBRgS7',
        },

        error: {
            '-1': '网络不佳, 请稍后再试',
            400: '服务器/页面接口请求不匹配',
            404: '请求的数据接口不存在',
            500: '服务器内部错误，稍后再试',
            504: '服务器正在更新，请稍候再试',

            1005: '无效的验证码',
            1003: '班级信息不存在',

            1003: '手机还没有注册',
            1011: '手机号码已注册',
            1013: '该账号不存在',
            1014: '新密码不能和原密码相同',
            1015: '原密码不正确',


            1102: '您已经在班级中,无需重复加入',
            1103: '已退出该班级',
            1104: '未加入该班级',

            3000: '账号或密码错误',
            3002: '账号已在其他设备登录',
            3003: '账号已被禁用',
            3004: '账号和角色不匹配',
            3005: '上传失败, 请重新上传',

            5000: '请在手机设置>隐私>相机中开启应用相机访问权限'
        },

        api: {
            login: 'auth/login', // 登录
            register: 'auth/register', // 注册
            checkMobile: 'auth/check_phone_num', // 手机号检测
            sendCode: 'auth/send_phone_code', // 发送验证码
            updatePwd: 'auth/user/update_password', // 重置密码
            resetPwd: 'auth/forget', // 忘记密码
            modifyPwd: 'auth/user/update_password', // 修改密码
            modifyInfo: 'auth/user/save_info', // 设置用户信息
            userInfo: 'auth/user/info', // 获取用户信息
            feedback: 'base/feedback', // 意见反馈

            searchClass: 'base/class', //搜索班级
            attendClass: 'student/class/join_class', // 加入班级
            attendedClass: 'student/class', // 已添加班级  我的班级


            liveClassDetail: 'student/group/group_info', //直播课课程详情
            liveClassListDetail: 'student/course/course_info', //直播课课程列表详情
            dailyClassDetail: 'student/task/class_task', //普通班课程详情
            quitClass: 'student/class/quit_class', // 退出班级

            Task: 'student/task', //获取作业信息
            StartTask: 'student/task/start_task', //开始作业
            AnswerList: 'student/task/answer_list', //答题卡
            TaskDetail: 'student/task/detail', //题目详情
            DoTask: 'student/task/do_task', //做作业
            SubmitTask: 'student/task/submit_task', //提交作业

            classReport: 'student/report/class_report',  // 测评报告
            courseReport: 'student/report/course_report',

            UploadImgBase64: 'base/upload/upload_base64_image', //上传图片base64
            UploadImg: 'base/upload/upload_image', //上传图片
            Version: 'base/version', //获取版本更新


            subjectList: 'student/wrong/get_subject_list', //获取学科列表
            loreList: 'student/wrong/get_lore_list', //获取知识点列表
            testList: 'student/wrong/get_test_list', //获取错题列表
            testAllList: 'student/wrong/get_all_test', //获取全部错题列表

            setGrasp: 'student/wrong/set_grasp', //设置错题掌握
            setPrint: 'student/wrong/set_print', //设置错题打印
            getPrintList: 'student/wrong/get_print_list', //错题打印列表
            printListSort: 'student/wrong/print_list_sort', // 错题打印列表排序
            printListDel: 'student/wrong/print_list_del',    // 错题打印列表删除
            printWrongTest: 'student/wrong/print_wrong_test',    // 错题打印


            checkToken: 'base/check_token'
        }
    })
