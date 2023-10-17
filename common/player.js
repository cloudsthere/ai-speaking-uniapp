let player = {
	context: null,
	cd: null,
	play(cd) {
		// console.log('play')
		// console.log(cd)
		// 停掉旧的
		if (this.cd) {
			this.cd.playing = false
		}
		this.cd = cd
		cd.playing = true
		this.context.src = cd.audio_url ?? cd.audio
		var that = this
		this.context.onEnded(() => {
			that.context.offEnded()
			cd.playing = false
		})
		this.context.play()
		return this.context
	},
	sound(url) {
		this.context.src = url
		this.context.play()
	},
	stop() {
		if (this.cd && this.cd.playing) {
			this.cd.playing = false;
		}
		this.context.stop()
	},
	init() {
		if (!this.context) {
			this.context = uni.createInnerAudioContext({
				obeyMuteSwitch: false,
			});
			// #ifdef MP-WEIXIN
			if (wx.setInnerAudioOption) {
				wx.setInnerAudioOption({
					obeyMuteSwitch: false
				})
			}
			// #endif
			
			var that = this
			this.context.onEnded(() => {
				// console.log('播放完毕')
				// console.log(that.playing_message)
				if (that.cd) {
					that.cd.playing = false
				}
				
			});
			
			this.context.onError((res) => {
				console.log('player error', res)
				// console.log(res.errMsg);
				// console.log(res.errCode);
				if (that.cd) {
					that.cd.playing = false
				}
			});
		}
		
	},
	switchPlay(cd) {
		if (cd.playing) {
			cd.playing = false
			this.stop()
		} else {
			this.play(cd)
		}
	}
}

player.init()

export default player;