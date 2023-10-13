<template>
	<view class="content">
		<template v-for="message in messages" :key="message.id">
			<view class="session ai-session text-gray-600" v-if="message.speaker == 'System'">
				<!-- <image class="avatar" :src="conv.avatar" mode=""></image> -->
				<view class="message-box">
					<!-- <view class="message-text">{{message.content}}</view> -->
					<view class="message-text">
						<template v-for="(word, i) in message.words" :key="i">
							<text v-if="['.', ',', '?', ' '].includes(word)">{{word}}</text>
							<text v-else @click="lookup(word)" class="word">{{word}}</text>
						</template>
					</view>
					<view class="message-dashboard">
						<uni-icons @click="translate(message)" :class="{playing: message.addition == 'translate'}"
							custom-prefix="iconfont" type="icon-fanyi" size="20"></uni-icons>
						<uni-icons @click="switchPlay(message)" :class="{playing: message.playing}"
							custom-prefix="iconfont" type="icon-laba" size="20"></uni-icons>
						<uni-icons @click="recommend(message)" :class="{playing: message.addition == 'recommend'}"
							custom-prefix="iconfont" type="icon-deng" size="20"></uni-icons>
					</view>
					<view class="mt-2 text-gray-500 text-xs" v-show="message.addition == 'translate'">
						{{message.translate}}
					</view>
					<view class="mt-2 flex flex-col gap-1 text-gray-500 text-xs"
						v-show="message.addition == 'recommend'">
						<view class="flex" v-for="(recommend, recommend_index) in message.recommends"
							:key="recommend_index">
							<span class="px-1 text-blue-500">•</span>
							<view>{{recommend}}</view>
						</view>
					</view>
				</view>
				<view class="placeholder"></view>
			</view>
			<view class="session user-session text-gray-600" v-if="message.speaker == 'User'">
				<!-- <image class="avatar" src="@/static/user-avatar.png" mode=""></image> -->
				<view class="message-box">
					<view class="message-text">{{message.content}}</view>

					<view class="message-dashboard">
						<!--
						<uni-icons @click="translate(message)" custom-prefix="iconfont" type="icon-fanyi" size="20"></uni-icons>
						-->
						<uni-icons @click="switchPlay(message)" :class="{playing: message.playing}"
							custom-prefix="iconfont" type="icon-laba" size="20"></uni-icons>
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
		<view class="text-center text-gray-600 mt-4" v-if="status == 'halt'">
			<text>课时不足，请</text>
			<navigator url="/pages/home/price" class="text-primary inline">购买会员→</navigator>
		</view>
		<view class="text-center text-gray-600 mt-4" v-if="status == 'end'">
			本次会话已结束
		</view>
	</view>
	<view class="dashboard bg-gray-100">
		<input v-model="question" @keyup.enter="sendQuestion" style="width: 80%; border: 1px; background: white;">
		<button @click="sendQuestion">发送</button>
		<button class="btn-speak text-gray-400" v-if="status == 'end'">已结束</button>
		<button class="btn-speak" v-else @longpress="handleRecordStart">按住 说话</button>
	</view>
	<dictionary ref="dictionary"></dictionary>
</template>

<script>
	import utils from '@/common/utils.js';
	import player from '@/common/player.js';
	import dictionary from '../component/dictionary.vue';

	// const recorderManager = uni.getRecorderManager();
	// const innerAudioContext = utils.createInnerAudioContext()

	export default {
		components: {
			dictionary,
		},
		data() {
			return {
				// none: 没有情况，recording: 用户录音，thinking: AI思考中，思考完后又回到none， halt:没钱停机，end: 已结束
				status: 'none',
				// status: 'end',
				conv: {},
				messages: [],
				recording: false,
				recoManager: null,
				voice_file: null,
				question: '',
				tik: null,
				dialog_id: null,
				dict: null,
				// playing_message: null,
			}
		},
		onLoad(options) {
			// console.log(options)
			var that = this
			var method = 'GET'
			var url = '/api/conversation/' + options.conv_id
			var data = {}

			uni.authorize({
				scope: 'scope.record',
				success() {
					console.log('onLoad 已有权限')
				},
				fail() {
					console.log('onLoad 没有权限，应去授权')
					uni.showToast({
						title: '请先授权麦克风',
						complete() {
							uni.openSetting()
						}
					})
				}
			})


			utils.request(method, url, data, (res) => {
				if (res.conversation.end) {
					that.status = 'end'
				} else if (res.halt) {
					that.status = 'halt'
				}
				that.conv = res.conversation
				that.messages = res.messages
				uni.setNavigationBarTitle({
					title: that.conv.topic ?? '会话'
				})
				// console.log(that.messages[that.messages.length - 1])
				// that.scrollToBottom()
				// if (that.messages[that.messages.length - 1]) {
				// 	that.play(that.messages[that.messages.length - 1])
				// }
				if (that.messages.length == 0) {
					utils.request('POST', '/api/message', {
						conv_id: options.conv_id
					}, (res) => {
						// console.log(res)
						that.messages.push(res.message)
						// console.log(that.messages[0])
						that.play(that.messages[0])
					})
				}
			})



			var plugin = requirePlugin("WechatSI")
			this.recoManager = plugin.getRecordRecognitionManager()
			this.recoManager.onRecognize = function(res) {
				console.log("current result", res.result)
			}
			this.recoManager.onStop = function(res) {
				console.log("record file path", res.tempFilePath)
				// that.voice_file = res.tempFilePath
				console.log("content", res.result)
				// that.scrollToBottom()
				if (!res.result) {
					uni.showToast({
						title: '未能识别，请再试'
					})
					that.status = 'none'
					return
				}
				that.sendMessage(res.result, res.tempFilePath)
			}
			this.recoManager.onStart = function(res) {
				console.log("成功开始录音识别", res)
			}
			this.recoManager.onError = function(res) {
				console.error("error msg", res.msg)
			}
			// this.recoManager.start({duration:30000, lang: "zh_CN"})
			// this.lookup('rain')
		},
		onShow() {
			this.createDialog()
		},
		onHide() {
			this.cleanUp()
		},
		onUnload() {
			this.cleanUp()
		},
		onShareAppMessage(res) {
			return utils.share()
		},
		onShareTimeline(res) {
			return utils.share()
		},
		methods: {
			recommend(message) {
				if (!message.recommends) {
					var that = this
					utils.request('POST', '/api/recommend', {
						// source: message.content
						conv_id: this.conv.id,
						message_id: message.id
					}, (res) => {
						// console.log(res)
						message.recommends = res.recommends
					})
				}
				message.addition = 'recommend'
			},
			translate(message) {
				if (!message.translate) {
					utils.request('POST', '/api/translate', {
						source: message.content
					}, (res) => {
						// console.log(res)
						message.translate = res.translate
					})
				}
				message.addition = 'translate'
			},
			cleanUp() {
				this.handleRecordStop()
				player.stop();
				clearInterval(this.tik)
				this.tik = null
				if (this.dialog_id) {
					utils.request('POST', '/api/dialog/' + this.dialog_id + '/end', {}, (res) => {
						// console.log(res)
					})
				}

			},
			createDialog() {
				var that = this
				var sil = setInterval(() => {
					if (that.conv.id) {
						clearInterval(sil)
						// console.log(that.conv)
						utils.request('POST', '/api/dialog', {
							conv_id: that.conv.id
						}, (res) => {
							that.dialog_id = res.dialog_id
						})
					}
					if (that.status == 'halt') {
						clearInterval(sil)
					}
				}, 300)
				// console.log('this.conv', this.conv)

			},
			sendQuestion() {
				this.sendMessage(this.question)
				this.question = ''
			},
			testSend() {
				console.log('testSend')
				this.sendMessage('hello')
			},
			lookup(word) {
				// console.log(word)
				// var that = this
				this.$refs.dictionary.lookup(word)

			},
			switchPlay(message) {
				player.switchPlay(message)
			},
			play(cd) {
				// innerAudioContext.go(cd)
				player.play(cd)
			},
			handleRecordStart() {
				player.stop()

				if (this.status == 'halt') {
					uni.showToast({
						title: '课时不足，请先购买会员',
						icon: 'none'
					})
					return;
				}

				// #ifdef MP-WEIXIN
				wx.vibrateShort({
					type: 'light'
				})
				// #endif

				var that = this
				// 先取得权限
				uni.getSetting({
					success(res) {
						console.log('getSetting', res.authSetting)
						if (!res.authSetting['scope.record']) {
							uni.showToast({
								title: '请先授权麦克风',
								complete() {
									uni.openSetting()
								}
							})
						} else {
							that.recoManager.start({
								lang: "en_US"
							})

							that.status = 'recording'
						}
					}
				})
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

			sendMessage(content, voice_file) {
				var that = this

				this.messages.push({
					speaker: 'User',
					content,
					audio_url: voice_file
				})
				this.scrollToBottom()

				this.status = 'thinking'

				// console.log('voice_file', voice_file)
				// 读取文件内容并进行Base64编码
				uni.getFileSystemManager().readFile({
					filePath: voice_file,
					success(data) {
						// console.log(data)
						// console.log(data.data)
						// const audio_str = data.data.toString('base64'); // 对音频数据进行Base64编码
						// console.log(audio_str)
						// 创建一个Uint8Array视图来读取ArrayBuffer
						// let view = new Uint8Array(data.data);

						// 创建一个TextDecoder实例
						// let decoder = new TextDecoder();

						// 将视图内容解码为字符串
						// let str = decoder.decode(view);
						let audio_str = uni.arrayBufferToBase64(data.data)
						// 输出字符串
						// console.log(audio_str);
						// 发送Base64编码后的音频数据到PHP服务端
						// sendDataToServer(audioData);
						utils.request('POST', '/api/message', {
							content,
							conv_id: that.conv.id,
							audio: audio_str,
						}, (res) => {
							if (res.error == 0) {
								// let message = res.message
								// message.words = message.content.split(/([\.\?, ])/).filter(item => item !== '')
								// console.log(message.words)
								that.messages.push(res.message)
								that.play(that.messages[that.messages.length - 1])
								that.scrollToBottom()
								if (res.end) {
									that.status = 'end'
								} else {
									that.status = 'none'
								}
							} else {
								if (res.error == 102) {
									that.status = 'halt'
								} else {
									uni.showToast({
										title: '网络错误，请稍后再试',
										icon: 'none',
									})
								}

							}

						})
					},
					fail(error) {
						console.log('读取文件失败', error);
					}
				});




			},
		}
	}
</script>

<style lang="scss">
	page {
		background-color: $app-bg-gray;
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

	.word:hover {
		text-decoration-line: underline;
	}
</style>