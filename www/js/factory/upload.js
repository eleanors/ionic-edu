angular.module('starter.factories')



.factory('UploadImg', function($ionicActionSheet, $cordovaCamera, $cordovaActionSheet, Request, Config, AuthService, $localStorage, $cordovaFileTransfer, Public, $ionicLoading, $cordovaFileTransfer, $cordovaFile, $localStorage, $location, CameraAndPhoto) {

    return {
        //显示
        show: function(success, error) {
            var upload = function(result) { // 0: camera   1: picture

                $ionicLoading.show({
                    template: '<ion-spinner></ion-spinner><br>正在加载，请稍候...'
                });
                if (result === 0) {
                    CameraAndPhoto.openCamera().then(function(result) {
                        $ionicLoading.hide();
                        upImage(result);
                    }, function(data) {
                        $ionicLoading.hide();
                    });
                } else {
                    var source = Camera.PictureSourceType.PHOTOLIBRARY;
                    var options = {
                        quality: 60,
                        destinationType: 1,
                        sourceType: source,
                        allowEdit: false,
                        EncodingType: 1,
                        mediaType: 0,
                        cameraDirection: 0,
                        popoverOptions: CameraPopoverOptions,
                        saveToPhotoAlbum: true
                    };

                    if(ionic.Platform.isAndroid()){
                        CameraAndPhoto.openAlbum().then(function(result) {
                            upImage(result);
                        }, function(data) {
                            $ionicLoading.hide();
                        });
                    }else{
                        $cordovaCamera.getPicture(options).then(function(imageData) {

                            CameraAndPhoto.openCrop(imageData).then(function(result) {
                                upImage(result);
                            }, function(data) {
                                $ionicLoading.hide();
                            });
                        }, function(err) {
                            $ionicLoading.hide();
                        })
                    }
                }

                var upImage = function(imagePath) {
                    var path, name, filePattern;
                    filePattern = imagePath.match(/^(.*)\/([^/].*)$/);

                    if (!filePattern) return;

                    $ionicLoading.show({
                        template: '<ion-spinner></ion-spinner><br>正在上传...'
                    })

                    path = filePattern[1];
                    name = filePattern[2];
                    $cordovaFile.readAsDataURL(path, name)
                    .then(function(data) {
                        var base64 = [];
                        if (data) {
                            base64 = data.split(',');
                            Request.UploadImgBase64({
                                file: base64[1],
                                file_ext: 'jpg'
                            }).then(function(result) {
                                $ionicLoading.hide();
                                success(result.url);
                            });
                        }
                    }, function() {
                        $ionicLoading.hide();
                        Public.Toast(Config.error[3005]);
                    }).finally(function() {

                        $cordovaFile.checkFile(path + '/', name)
                        .then(function(result) {
                            $cordovaFile.removeFile(path, name);
                        })
                    })
                };
            };

            Public.ActionSheet(upload);
        }
    };
})


.factory('ExtractImg', function($rootScope, $ionicActionSheet, $cordovaCamera, $cordovaActionSheet, Request, Config, $localStorage, $cordovaFileTransfer, $ionicLoading, Public) {
    return {
        //显示
        show: function(success, error) {
            var source = function(resp) {
                var source;
                if (resp === 0) {
                    source = Camera.PictureSourceType.CAMERA;
                } else {
                    source = Camera.PictureSourceType.PHOTOLIBRARY;
                }
                var options = {
                    quality: 60,
                    destinationType: 1,
                    sourceType: source,
                    allowEdit: false,
                    encodingType: Camera.EncodingType.JPEG,
                    mediaType: 0,
                    cameraDirection: 1,
                    popoverOptions: CameraPopoverOptions,
                    saveToPhotoAlbum: false
                };
                $cordovaCamera.getPicture(options).then(function(imageData) {
                    $ionicLoading.show({
                        template: '<ion-spinner></ion-spinner><br>正在加载，请稍候...'
                    });
                    if (ionic.Platform.isAndroid()) {
                        window.FilePath.resolveNativePath(imageData, function(res) {

                            lrz(res)
                            .then(function(rst) {
                                $ionicLoading.hide();
                                success({ url: rst.base64 });
                                // 处理成功会执行
                            })
                            .catch(function(err) {
                                $ionicLoading.hide();
                                error('请选择一张图片', false);
                                // 处理失败会执行
                            });
                        });
                    } else {
                        lrz(imageData)
                        .then(function(rst) {
                            $ionicLoading.hide();
                            success({ url: rst.base64 });
                            // 处理成功会执行
                        })
                        .catch(function(err) {
                            $ionicLoading.hide();
                            error('请选择一张图片', false);
                            // 处理失败会执行
                        });
                    }
                }, function(err) {
                    error('请选择一张图片', false);
                });
            };
            Public.ActionSheet(source);
        }
    };
})
