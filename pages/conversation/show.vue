<template>
	<view class="content">
		<template v-for="message in messages" :key="message.id">
			<view class="session ai-session text-gray-600" v-if="message.role == 'assistant'">
				<image class="avatar" :src="conv.avatar" mode=""></image>
				<view class="message-box">
					<view class="message-text">{{message.content}}</view>
					<view class="message-dashboard">
						<uni-icons custom-prefix="iconfont" type="icon-fanyi" size="20"></uni-icons>
						<uni-icons @click="switchPlay(message)" :class="{playing: message.playing}" custom-prefix="iconfont" type="icon-laba" size="20"></uni-icons>
					</view>
				</view>
				<view class="placeholder"></view>
			</view>
			<view class="session user-session text-gray-600" v-if="message.role == 'user'">
				<image class="avatar" src="@/static/user-avatar.png" mode=""></image>
				<view class="message-box">
					<view class="message-text">{{message.content}}</view>
					<view class="message-dashboard">
						<uni-icons custom-prefix="iconfont" type="icon-fanyi" size="20"></uni-icons>
						<uni-icons @click="switchPlay(message)" :class="{playing: message.playing}" custom-prefix="iconfont" type="icon-laba" size="20"></uni-icons>
					</view>
				</view>
				<view class="placeholder"></view>
			</view>
		</template>
		<view class="session ai-session recording" v-if="status == 'thinking'">
			<image class="avatar" :src="conv.avatar" mode=""></image>
			<view class="message-box">
				<view class="message-text">思考中...</view>
			</view>
		</view>
		<view class="session user-session recording" v-show="status == 'recording'">
			<image class="avatar" src="@/static/user-avatar.png" mode=""></image>
			<view class="message-box twinkling">
				<view class="message-text">
					收听中...
				</view>
			</view>
		</view>
	</view>
	<view class="dashboard bg-gray-100">
		<input v-model="question" @keyup.enter="sendQuestion" style="width: 80%; border: 1px; background: white;">
		<button @click="sendQuestion">发送</button>
		<button class="btn-speak text-gray-400" @longpress="handleRecordStart" @touchmove="handleTouchMove"
			@touchend="handleRecordStop" @tap="testSend">按住 说话</button>
	</view>
</template>

<script>
	import utils from '@/utils.js'

	// const recorderManager = uni.getRecorderManager();
	const innerAudioContext = uni.createInnerAudioContext({
		obeyMuteSwitch: false,
	});
	// #ifdef MP-WEIXIN
	if (wx.setInnerAudioOption) {
		wx.setInnerAudioOption({
			obeyMuteSwitch: false
		})
	}
	// #endif

	innerAudioContext.onEnded(() => {
		// console.log('播放完毕')
		// console.log(that.playing_message)
		if (innerAudioContext.message) {
			innerAudioContext.message.playing = false
		}
	});
	
	innerAudioContext.onError((res) => {
		console.log(res.errMsg);
		console.log(res.errCode);
	    if (innerAudioContext.message) {
	    	innerAudioContext.message.playing = false
	    }
	});

	export default {
		data() {
			return {
				// none: 没有情况，recording: 用户录音，thinking: AI思考中，思考完后又回到none
				status: 'none',
				conv: {},
				messages: [],
				recording: false,
				recoManager: null,
				voice_file: null,
				question: '',
				tik: null,
				// playing_message: null,
			}
		},
		onLoad(options) {
			// console.log(options)
			var that = this
			if (options.scene_id) {
				var method = 'POST'
				var url = '/api/conversation'
				var data = {
					scene_id: options.scene_id
				}
			} else if (options.conv_id) {
				var method = 'GET'
				var url = '/api/conversation/' + options.conv_id
				var data = {}
			}
			

			utils.request(method, url, data, (res) => {
				// console.log(res)
				that.conv = res.conversation
				that.messages = res.messages
				uni.setNavigationBarTitle({
					title: that.conv.name
				})
				// console.log(that.messages[that.messages.length - 1])
				that.scrollToBottom()
				that.play(that.messages[that.messages.length - 1])
			})



			// recorderManager.onStop(function(res) {
			// 	console.log('recorder stop' + JSON.stringify(res));
			// 	that.voicePath = res.tempFilePath;
			// });

			var plugin = requirePlugin("WechatSI")
			this.recoManager = plugin.getRecordRecognitionManager()
			this.recoManager.onRecognize = function(res) {
				console.log("current result", res.result)
			}
			this.recoManager.onStop = function(res) {
				// console.log("record file path", res.tempFilePath)
				that.voice_file = res.tempFilePath
				// console.log("result", res.result)
				that.scrollToBottom()
				that.sendMessage(res.result)
			}
			this.recoManager.onStart = function(res) {
				console.log("成功开始录音识别", res)
			}
			this.recoManager.onError = function(res) {
				console.error("error msg", res.msg)
			}
			// this.recoManager.start({duration:30000, lang: "zh_CN"})

			// 每10秒上报
			this.tik = setInterval(() => {
				utils.request('POST', '/api/tik/' + this.conv.id, {}, () => {})
			}, 10000)
		},
		onHide() {
			this.cleanUp()
		},
		onUnload() {
			this.cleanUp()
		},
		methods: {
			cleanUp() {
				innerAudioContext.stop();
				clearInterval(this.tik)
				this.tik = null
			},
			sendQuestion() {
				this.sendMessage(this.question)
				this.question = ''
			},
			testSend() {
				console.log('testSend')
				this.sendMessage('hello')
			},
			switchPlay(message) {
				if (message.playing) {
					message.playing = false
					innerAudioContext.stop()
				} else {
					this.play(message)
				}
			},
			play(message) {
				// console.log('play')
				// console.log(message)
				// 停掉旧的
				if (innerAudioContext.message) {
					innerAudioContext.message.playing = false
				}
				innerAudioContext.message = message
				message.playing = true
				innerAudioContext.src = message.audio_url
				innerAudioContext.play()
			},
			handleRecordStart() {
				innerAudioContext.stop()

				// #ifdef MP-WEIXIN
				wx.vibrateShort({
					type: 'light'
				})
				// #endif

				this.recoManager.start({
					lang: "en_US"
				})
				
				this.status = 'recording'
			},
			handleRecordStop() {
				this.recording = false
				this.recoManager.stop()
			},
			scrollToBottom: function() {
				var query = wx.createSelectorQuery();
				query.select('.content').boundingClientRect();
				query.exec(function(res) {
					// console.log(res[0])
					if (res[0]) {
						uni.pageScrollTo({
							scrollTop: res[0].height + 900
						})
					}
				})
			},
			sendMessage(content) {
				var that = this

				this.messages.push({
					role: 'user',
					content,
					audio_url: this.voice_file
				})
				this.scrollToBottom()
				
				this.status = 'thinking'
				
				utils.request('POST', '/api/message', {
					content,
					conv_id: that.conv.id
				}, (res) => {
					that.messages.push(res.message)
					that.play(that.messages[that.messages.length - 1])
					that.scrollToBottom()
					that.status = 'none'
				})


			},
		}
	}
</script>

<style lang="scss">
	page {
		background-color: rgb(243 244 246);
	}

	.content {
		padding: 10px;
		padding-bottom: 200px;
	}

	.session {
		display: flex;
		font-size: 14px;
		margin-top: 40rpx;
		gap: 20rpx;

		.avatar {
			flex: none;
			border-radius: 50%;
			width: 40px;
			height: 40px;
		}

		.message-box {
			background-color: white;
			border-radius: $uni-border-radius-lg;
			padding: 10px;
		}

		.placeholder {
			width: 40px;
			flex: none;
		}

		.message-dashboard {
			display: flex;
			margin-top: 6px;
			gap: 8px;
		}

		.operator {
			width: 20px;
			height: 20px;
		}
	}

	.user-session {
		flex-direction: row-reverse;
		.message-dashboard {
			justify-content: flex-end;
		}
	}
	

	.recording {
		.message-box {
			flex: none;
			width: 60px;
		}
	}
	
	.playing {
		text {
			color: #1296db !important;
		}
	}

	.dashboard {
		position: fixed;
		padding-bottom: 20px;
		bottom: 0;
		right: 0;
		left: 0;

		.btn-speak {
			width: 80%;
			background-color: white;
			border-radius: 50px;
			text-align: center;
		}
	}

	@keyframes twinkle {
		0% {
			opacity: 1;
		}

		100% {
			opacity: 0.3;
		}
	}

	.twinkling {
		animation: twinkle 1s infinite alternate;
	}
</style>