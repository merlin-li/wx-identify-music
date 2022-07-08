Page({
  data: {
    title: '...',
    btnText: '点击开始识别',
    status: 'none', // none: 未开始   start：识别中
    recordData: null,
    tempFilePath: '',
    recordingTimeqwe: 0,
    setInter: '',
    recordTimer: '', //记录每分钟识别一次
    musicName: '歌曲名',
    musicSubTitle: '-'
  },

  onLoad() {
    const that = this;
    that.recorderManager = wx.getRecorderManager();

    that.recorderManager.onStop(res => {
      that.setData({
        tempFilePath: res.tempFilePath // 文件临时路径
      });
      clearInterval(that.data.setInter);

      // 上传文件录音文件并识别
      wx.uploadFile({
        url: '/records/',
        filePath: res.tempFilePath,
        name: 'music',
        header: {
          "Content-Type": "multipart/form-data"
        },
        //参数绑定
        formData: {
          recordingtime: that.data.recordingTimeqwe,
          praisepoints: 0
        },
        success: function(ress) {
          wx.showToast({
            title: '识别完成',
            icon: 'success',
            duration: 2000
          });

          console.log(ress)
          if (ress.statusCode === 200) {
            let result = JSON.parse(ress.data);
            if (result && result.status && result.status.msg === 'Success') {
              const { music } = result.metadata;
              if (music && music.length) {
                that.setData({
                  musicName: music[0].title,
                  musicSubTitle: music[0].album.name || ''
                })
              }
            }
          }
        },
        fail: function(ress) {
         console.log("API 失败。。");
        }
      });
    });

    that.recorderManager.onError(res => {
      console.log('record failed');
    });
  },

  onHide() {
    this.stopRecordInter();
  },

  //录音计时器, 计数多少秒
  recordingTimer() {
    let that = this;
    // 将计时器赋值给 setInter
    that.data.setInter = setInterval(() => {
      let time = that.data.recordingTimeqwe + 1;
      that.setData({
        recordingTimeqwe: time
      })
    }, 1000);
  },

  // 每隔60秒做一次识别
  startRecordInt() {
    const that = this;
    that.data.recordTimer = setInterval(() => {
      console.log('/////')
      that.startIdentify();
    }, 60000);
  },

  stopRecordInter() {
    if (this.data.recordTimer) {
      clearInterval(this.data.recordTimer);
    }
  },

  // 开始识别
  bindStart() {
    if (this.data.status === 'start') {
      this.stopIdentify();
      this.stopRecordInter();
    } else {
      this.startIdentify();
      this.startRecordInt();
    }
  },

  // 开始识别
  startIdentify() {
    this.recordingTimer();
    this.recorderManager.start({
      duration: 6000, // 时长
      sampleRate: 16000, //采样率，有效值 8000/16000/44100
      numberOfChannels: 1, //录音通道数，有效值 1/2
      encodeBitRate: 96000, //编码码率
      format: 'mp3', //音频格式，有效值 aac/mp3
      frameSize: 50, //指定帧大小
      audioSource: 'auto' //指定录音的音频输入源，可通过 wx.getAvailableAudioSources() 获取
    });

    this.setData({
      title: '识别中。。。。。',
      btnText: '点击停止识别',
      status: 'start'
    });
  },

  // 结束识别
  stopIdentify() {
    this.recorderManager.stop();
    this.setData({
      title: '识别完成',
      status: 'none',
      btnText: '点击开始识别'
    });
  },

  bindStop() {},

  //播放录音
  play () {
    // 获取innerAudioContext实例
    const innerAudioContext = wx.createInnerAudioContext();
    // 是否自动播放
    innerAudioContext.autoplay = true;
    // 设置音频文件的路径
    innerAudioContext.src = this.data.tempFilePath;
    // 播放音频文件
    innerAudioContext.onPlay(() => {
      console.log('开始播放');
    });
    // 监听音频播放错误事件
    innerAudioContext.onError((res) => {
      console.log(res.errMsg);
      console.log(res.errCode);
    });
  }
})
