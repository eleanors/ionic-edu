## 秦学云课堂学生端Ionic ##

开发分支

``````````````````
    develop    开发分支
    
    ionic      测试分支
    
    master     发布分支
    
`````````````````
    
    
安装方法

``````````````````

    npm install -g cnpm --registry=https://registry.npm.taobao.org
    
    cnpm install
    
    ionic platform add android
    
    ionic platform add ios
    
    gulp prod  
    
    cordova-hcp build www/dist/
       
    cordova prepare ios --browserify
    
    
`````````````````
    

找到

    platforms/android/AndroidManifest.xml
    
替换
    
    Theme.DeviceDefault.NoActionBar
    为
    Theme.NoTitleBar.Fullscreen
    
复制

    config/CordovaActivity.java
    
替换

    platforms/android/CordovaLib/src/org/apache/cordova/CordovaActivity.java
    
继续执行
    
    ionic build android(ios)
    
    ionic run android


