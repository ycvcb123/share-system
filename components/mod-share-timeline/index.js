Component({
    properties: {
        timelineShow: {
            type: Boolean,
            value: false
        },
        picContent: {
            type: Object,
            value: {},
            observer(val) {
                this.createShareImage(val);
            }
        }
    },
    data: {
        width: 0,
        height: 0,
        factor: 0, //设备像素比
        sharePicPath: '',
        screenWidth: '',
        screenHeight: '',
        //便于整体移动的相对top
        relativeTop: 0,
        path: ''
    },
    attached() {
        var that = this;
        var sysInfo = wx.getSystemInfoSync();
        var screenWidth = sysInfo.screenWidth;
        var screenHeight = sysInfo.screenHeight;

        var factor = (screenWidth / 750).toFixed(2);
        that.setData({
            factor,
            screenWidth,
            screenHeight
        }, () => {
            console.log('factor::', that.data.factor);
        });
    },
    methods: {
        toPx: function(rpx) {
            var { factor } = this.data;
            return rpx * factor;
        },
        toRpx: function(px) {
            var { factor } = this.data;
            return px / factor;
        },
        //base64格式图片处理
        handleBase64Img: function() {
            var fsm = wx.getFileSystemManager();
            var FILE_BASE_NAME = 'tmp_base64src';

            var base64src = function(base64data) {
                return new Promise((resolve, reject) => {
                    var [, format, bodyData] = /data:image\/(\w+);base64,(.*)/.exec(base64data) || [];
                    if (!format) {
                        reject(new Error('ERROR_BASE64SRC_PARSE'));
                    }
                    var filePath = `${wx.env.USER_DATA_PATH}/${FILE_BASE_NAME}.${format}`;
                    fsm.writeFile({
                        filePath,
                        data: bodyData,
                        encoding: 'base64',
                        success() {
                            resolve(filePath);
                        },
                        fail() {
                            reject(new Error('ERROR_BASE64SRC_WRITE'));
                        },
                    });
                });
            };

            return base64src;
        },
        createShareImage: function() {
            var that = this;
            var { screenWidth, screenHeight } = that.data;
            that.ctx = wx.createCanvasContext('myCanvas', that);
            if (!!that.data.picContent && JSON.stringify(that.data.picContent) != "{}") {
                var { width, height, views, background } = that.data.picContent;

                width = that.toPx(width);
                height = that.toPx(height);

                that.setData({
                    width: width,
                    height: height,
                }, () => {
                    //背景色初始化
                    that.ctx.setFillStyle(background);
                    that.ctx.fillRect(0, 0, screenWidth, screenHeight);
                    //开始绘制
                    that.drawImageAndText(views);
                });
            }
        },
        //网络图片处理
        handleNetImg: function(path) {
            return new Promise((resolve, reject) => {
                wx.getImageInfo({
                    src: path,
                    success: function(res) {
                        resolve(res);
                    }
                });
            });
        },
        //绘制文字和图案
        drawImageAndText: function(views) {
            var that = this;
            //test
            views && views.map(item => {
                switch (item.type) {
                    case 'text':
                        that.drawTextItem(item);
                        break;
                    case 'image':
                        that.drawImageItem(item);
                        break;
                    case 'rect':
                        that.drawRectItem(item);
                        break;
                    case 'lineDash':
                        that.drawLineDash(item);
                        break;
                    default:
                        break;
                }
            });
            //test
            //canvas转图片
            that.ctx.draw(false, () => {
                setTimeout(() => {
                    wx.canvasToTempFilePath({
                        canvasId: 'myCanvas',
                        success: (res) => {
                            that.setData({
                                sharePicPath: res.tempFilePath
                            });
                        }
                    }, that);
                }, 300);
            });
        },
        //图片绘制
        drawImageItem: function(imageInfo) {
            var that = this;
            var { relativeTop } = that.data;
            var { path, top = 0, left = 0, width, height } = imageInfo;

            top = that.toPx(top) + relativeTop;
            left = that.toPx(left);
            width = that.toPx(width);
            height = that.toPx(height);

            if (/http/.test(path)) {
                that.handleNetImg(path).then((res) => {
                    path = res.path;
                    that.ctx.drawImage(path, left, top, width, height);
                });
            } else if (/^data:image\/(jpeg|png|gif);base64,/.test(path)) {
                var base64src = that.handleBase64Img();
                var handleBase64src = base64src(path);
                handleBase64src.then(res => {
                    that.setData({
                        path: res
                    });
                    that.ctx.drawImage(res, left, top, width, height);
                    that.ctx.draw(true);
                });
            } else {
                that.ctx.drawImage(path, left, top, width, height);
            }
        },
        //文字绘制
        drawTextItem: function(textInfo) {
            var that = this;
            var { relativeTop } = that.data;
            var { content, fontSize, color, top, left, bolder } = textInfo;
            //topx
            top = that.toPx(top) + relativeTop;
            left = that.toPx(left);
            fontSize = that.toPx(fontSize);

            that.ctx.setFillStyle(color);
            that.ctx.setFontSize(fontSize);
            if (bolder) {
                that.ctx.fillText(content, left, top - .3);
                that.ctx.fillText(content, left - .3, top);
            }
            that.ctx.fillText(content, left, top);
            if (bolder) {
                that.ctx.fillText(content, left, top + .3);
                that.ctx.fillText(content, left + .3, top);
            }
        },
        //形状绘制 (矩形)
        drawRectItem: function(rectInfo) {
            var that = this;
            var { screenHeight } = that.data;
            var { background, top = 0, left = 0, width = 0, height = 0, parent = false, radius, radiusVal, line, shadow = false, shadowColor } = rectInfo;
            //topx
            left = that.toPx(left);
            width = that.toPx(width);
            height = that.toPx(height);
            radiusVal = radiusVal && that.toPx(radiusVal);
            //是承载内容容器让它垂直居中
            if (parent) {
                top = Math.floor((screenHeight - height) / 2);
                that.setData({
                    relativeTop: top
                });
            } else {
                top = that.toPx(top);
            }

            if (radius == true) {
                that.drawRadiusRect(that.ctx, left, top, width, height, radiusVal, background, line, shadow, shadowColor);
            } else {
                that.ctx.setStrokeStyle('#cacacd');
                that.ctx.strokeRect(left, top, width, height);

                that.ctx.setFillStyle(background);
                that.ctx.fillRect(left, top, width, height);
            };
        },
        //形状绘制（圆角矩形）  
        drawRadiusRect: function(ctx, x, y, w, h, r, background, line, shadow, shadowColor) {
            ctx.save();
            // 开始绘制
            ctx.beginPath();
            // 因为边缘描边存在锯齿，最好指定使用 transparent 填充
            ctx.setFillStyle('transparent');
            // 左上角
            ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5);
            // 右上角
            ctx.arc(x + w - r, y + r, r, Math.PI * 1.5, Math.PI * 2);
            // 右下角
            ctx.arc(x + w - r, y + h - r, r, 0, Math.PI * 0.5);
            // 左下角
            ctx.arc(x + r, y + h - r, r, Math.PI * 0.5, Math.PI);
            // 回到左上角
            ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5);
            if (!line) {
                ctx.setFillStyle(background);
                ctx.fill();
            } else {
                ctx.setStrokeStyle(background);
                ctx.setShadow(4, 4, 16, shadowColor);
                ctx.stroke();
            }
            ctx.closePath();
            ctx.restore();

        },
        //形状绘制（虚线）
        drawLineDash: function(lineInfo) {
            var that = this;
            that.ctx.save();
            var { relativeTop } = that.data;
            var { lineDash, left, top, len, color } = lineInfo;

            left = that.toPx(left);
            top = that.toPx(top) + relativeTop;
            len = that.toPx(len);

            that.ctx.setLineDash(lineDash);
            that.ctx.beginPath();
            that.ctx.moveTo(left, top);
            that.ctx.lineTo(len, top);
            that.ctx.setStrokeStyle(color);
            that.ctx.stroke();
            that.ctx.restore();
        },
        //保存
        authorSave() {
            var that = this;
            wx.getSetting({
                success: (res) => {
                    if (!res.authSetting['scope.writePhotosAlbum']) {
                        console.log('没有获取授权');
                        wx.authorize({
                            scope: 'scope.writePhotosAlbum',
                            success: (res) => {
                                that.savePic();
                            }
                        })
                    } else {
                        that.savePic();
                    }
                }
            })
        },
        savePic: function() {
            var that = this;
            wx.saveImageToPhotosAlbum({
                filePath: that.data.sharePicPath,
                success: (res) => {
                    wx.showModal({
                        title: '已保存到手机相册',
                        content: '将图片发送到朋友圈，邀请好友加入',
                        confirmColor: '#0bc183',
                        confirmText: '知道了',
                        showCancel: false,
                        success: function(res) {
                            if (res.confirm) {
                                that.triggerEvent('closeTimelineShow');
                            }
                        }
                    })
                }
            })
        },
    }
});