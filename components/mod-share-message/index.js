Component({
    properties: {
        shareMessageInfo: {
            type: Object,
            value: {},
            observer: function() {
                this.createShareImage();
            }
        }
    },
    attached: function() {
        this.ctx = wx.createCanvasContext('myCanvas', this);
    },
    data: {
        shareMessageInfo: {},
        picPath: ''
    },
    methods: {
        createShareImage: function() {
            var that = this;
            var { fromLocation, toLocation, startTime, imagePath } = that.data.shareMessageInfo;
            //判断图片是否来源于网络
            if (/http/.test(imagePath)) {
                var imageInfo = that.handleNetImg(imagePath);
                imageInfo.then((res) => {
                    that.drawImageAndText(res.path);
                });
            } else {
                that.drawImageAndText(imagePath);
            }
        },
        //网络图片处理
        handleNetImg: function(imagePath) {
            var that = this;
            return new Promise((resolve, reject) => {
                wx.getImageInfo({
                    src: imagePath,
                    success: function(res) {
                        resolve(res);
                    }
                });
            });
        },
        //合并文字和图案
        drawImageAndText: function(path) {
            var that = this;
            //防止加载中canvas上下文没有生成
            if (!that.ctx) {
                return;
            }
            var { startTime, fromLocation, toLocation } = that.data.shareMessageInfo;
            //canvas设置
            // var testImg = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACYAAAAmCAMAAACf4xmcAAAAS1BMVEUAAAAJzYoJzooJzYoJzYoKzYsJzYoJzYoJzYoJzYsKzooKzYoJzYoGzosA0IQKzYsJzooJzYoJzYoJzYoIzooJzYoJzooIzYkJzYr39DZtAAAAGHRSTlMA7XLxpzHUz2/1TSzgJgxKqo6uzVyxjFuxifYiAAAA8UlEQVQ4y43UUbKDIAwF0AuCoIiibd/L/lfamU4LAcXJ+UaINwFUrE5OESmXtEXHqkdiRr3iglbUUB6t6OiCi6jME10aZjBP6nqyvehG3i8OdGP61efo1uObBHGL2XezEOc/qfK8jm/49uD5rfVmw4ZsYwVrAGNZFcCEsm4ELGV5r1NMgZ2Z0DjYTyT6sajwg0wpbcFJzsVBlS9OTI4EeTT+cLLnhgmXCQ8V/oI0EF3ajsaLxRtEzZK1vj9IMx+k7li+2rGEFwy55MoIL6DoOm+ix+G/irI6t4qoEh+X1Ue0fPcZlD+qteCTU9OknPEB3BuIYkw9hC3OwwAAAABJRU5ErkJggg==';
            that.ctx.drawImage(path, 0, 0, that.autoSize(420), that.autoSize(336));
            that.ctx.setFillStyle('#fff');
            that.ctx.setFontSize(32);
            that.ctx.fillText(startTime, 24, 54);
            that.ctx.setFillStyle('#38383c');
            that.ctx.setFontSize(28);
            var infoArr = [fromLocation, toLocation];

            for (var i = 0; i < infoArr.length; i++) {
                infoArr[i] = infoArr[i].length > 12 ? `${infoArr[i].substring(0,12)}...` : infoArr[i];
                if (i == 0) {
                    that.ctx.fillText(infoArr[i], 50, 120);
                    that.ctx.drawImage('/common/images/canvas-start-flag.png', 24, 102, 12, 12);
                } else {
                    that.ctx.fillText(infoArr[i], 50, 120 + i * 40);
                    that.ctx.drawImage('/common/images/canvas-end-flag.png', 24, 102 + i * 42, 12, 12);
                }
            }
            //画小圈圈
            that.ctx.drawImage('/common/images/line-flag.png', 28, 119, 3, 19);

            //canvas转图片
            that.ctx.draw(true, () => {
                setTimeout(() => {
                    wx.canvasToTempFilePath({
                        canvasId: 'myCanvas',
                        success: (res) => {
                            that.triggerEvent('sharePic', { picPath: res.tempFilePath });
                        }
                    }, that);
                }, 300);
            });
        },
        //图片尺寸兼容
        autoSize: function(num) {
            var scale = wx.getSystemInfoSync().windowWidth / 375;
            return num * scale
        }
    }
});