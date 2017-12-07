angular.module('starter.factories')

.factory('imageLoaded', ['$window', function($window){

	var imageLoadedComplate = function(image, type){

        if (image.naturalHeight + image.naturalWidth === 0) {
            $window.contentImgError(image, type);
        }
    }

    var imageLoadedFailure = function (image, type){ 
        var url = image.src;
        var element = angular.element(image);
        var textView = angular.element('<span class="image-load-error">图片加载失败, 点击重新加载</span>')
        .css('display', 'inline-block');
        element.attr('title', '');

        if(element.length) reload(element[0], url, 3);
        function reload (elem, url, maxnum){
            var image = new Image();
            if(maxnum > 0){
                image.onerror = function(){
                    reload(elem, url, maxnum-1);
                };
                image.onload = function(){
                    if (image.naturalHeight + image.naturalWidth === 0) {
                        maxnum = 2;
                        return image.onerror();
                    }
                    elem.src = url;
                    image.onerror = image.onload = null;
                }
                image.src = url;
            }else{
                if(type){
                    element.css('display', 'none').after(textView);
                    textView.off().on('click', function(){
                        var image = new Image();
                        angular.element(image).on('load', function(){
                            element.css('display', 'block');
                            textView.css('display', 'none');
                            element.prop('src', url);
                        })
                        image.src = url;
                    })
                }
                image.onerror = image.onload = null;
            }
        }
    }

    $window.imageLoadedFailure = imageLoadedFailure;
    $window.imageLoadedComplate = imageLoadedComplate;

	return {
			imageLoadedFailure: imageLoadedFailure,
			imageLoadedComplate: imageLoadedComplate
	}
}])