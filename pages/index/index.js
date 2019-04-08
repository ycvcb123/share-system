import { setShareInfo } from '../../common/config/share-config';

Page({
    data: {
        shareMessageInfoTimeline: {},
        shareMessageInfoMessage: {},
        sharePicPath: ''
    },
    onLoad: function() {
        this.setData({
            shareMessageInfoTimeline: setShareInfo('3月7号 下午16:30发车', '腾讯大厦', '平安国际中心', ''),
            shareMessageInfoMessage: {
                startTime: '3月7号 下午16:30发车',
                fromLocation: '腾讯大厦',
                toLocation: '平安国际中心',
                imagePath: '/common/images/share-2.png'
            }
        });
    },
    getSharePicPath: function(e) {
        var sharePicPath = e.detail.picPath;
        this.setData({
            sharePicPath
        });
    },
    onShareAppMessage: function() {
        return {
            title: '测试用',
            imageUrl: this.data.sharePicPath,
            path: '/pages/index/index'
        }
    },
    shareTimeLine: function() {
        this.setData({
            timelineShow: true
        });
    },
    closeTimelineShow: function() {
        this.setData({
            timelineShow: false
        });
    }
})