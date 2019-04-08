function setShareInfo(time, start, end, imageSrc) {
    return {
        width: 750,
        height: 1300,
        background: '#F2FCF8',
        views: [{
                type: 'rect',
                parent: true,
                radius: true,
                radiusVal: 16,
                left: 40,
                width: 670,
                height: 1140,
                shadow: true,
                background: '#cacacd',
                shadowColor: 'rgba(0,0,0,.6)',
                line: true
            },
            {
                type: 'rect',
                parent: true,
                radius: true,
                radiusVal: 16,
                left: 40,
                width: 670,
                height: 1140,
                background: '#fff',
                line: false
            },
            {
                type: 'lineDash',
                lineDash: [4, 4],
                color: '#E5E5E5',
                top: 930,
                left: 40,
                len: 710
            },
            {
                type: 'image',
                path: '/common/images/share-t-pic.png',
                top: 40,
                left: 80,
                width: 590,
                height: 474
            },
            {
                type: 'text',
                content: '邀你一起加入拼车',
                color: '#38383C',
                top: 608,
                left: 80,
                fontSize: 48,
                font: 'PingFangSC-Medium',
                bolder: true
            },
            {
                type: 'text',
                content: time,
                color: '#38383C',
                top: 704,
                left: 80,
                fontSize: 36,
                font: 'DIN-Medium',
                bolder: true
            },
            {
                type: 'text',
                content: start,
                color: '#38383C',
                top: 776,
                left: 128,
                fontSize: 32,
                font: 'PingFangSC-Medium',
                bolder: true
            },
            {
                type: 'text',
                content: end,
                color: '#38383C',
                top: 846,
                left: 128,
                fontSize: 32,
                font: 'PingFangSC-Medium',
                bolder: true
            },
            {
                type: 'text',
                content: '长按或扫描二维码，查看这条线路',
                color: '#9B9BA1',
                top: 1052,
                left: 224,
                fontSize: 28,
                font: 'PingFangSC-Medium',
                // bolder: true
            },
            {
                type: 'image',
                path: imageSrc || '/common/images/busCode.png',
                top: 972,
                left: 80,
                width: 128,
                height: 128
            },
            {
                type: 'image',
                path: '/common/images/station-flag.png',
                top: 746,
                left: 80,
                width: 32,
                height: 104
            }
        ]
    }
}

export {
    setShareInfo
}