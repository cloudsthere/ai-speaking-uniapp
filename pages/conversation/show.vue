<template>
	<view class="content">
		<template v-for="message in messages" :key="message.id">
			<view class="session ai-session text-gray-600" v-if="message.role == 'assistant'">
				<image class="avatar" :src="conv.avatar" mode=""></image>
				<view class="message-box">
					<!-- <view class="message-text">{{message.content}}</view> -->
					<view class="message-text">
						<template v-for="(word, i) in message.words" :key="i">
							<text v-if="['.', ',', '?', ' '].includes(word)">{{word}}</text>
							<text v-else @click="lookup(word)"  class="word">{{word}}</text>
						</template>
					</view>
					<view class="message-dashboard">
						<uni-icons @click="translate(message)" custom-prefix="iconfont" type="icon-fanyi"
							size="20"></uni-icons>
						<uni-icons @click="switchPlay(message)" :class="{playing: message.playing}"
							custom-prefix="iconfont" type="icon-laba" size="20"></uni-icons>
					</view>
					<view class="mt-2">
						{{message.translate}}
					</view>
				</view>
				<view class="placeholder"></view>
			</view>
			<view class="session user-session text-gray-600" v-if="message.role == 'user'">
				<image class="avatar" src="@/static/user-avatar.png" mode=""></image>
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
	</view>
	<view class="dashboard bg-gray-100">
		<input v-model="question" @keyup.enter="sendQuestion" style="width: 80%; border: 1px; background: white;">
		<button @click="sendQuestion">发送</button>
		<button class="btn-speak text-gray-400" @longpress="handleRecordStart" @touchmove="handleTouchMove"
			@touchend="handleRecordStop">按住 说话</button>
	</view>
	<dictionary ref="dictionary" :dict="dict"></dictionary>
</template>

<script>
	import utils from '@/common/utils.js';
	import dictionary from '../component/dictionary.vue';

	// const recorderManager = uni.getRecorderManager();
	const innerAudioContext = utils.createInnerAudioContext()

	export default {
		components: {
			dictionary,
		},
		data() {
			return {
				// none: 没有情况，recording: 用户录音，thinking: AI思考中，思考完后又回到none， halt:没钱停机
				status: 'none',
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
				if (res.halt) {
					that.status = 'halt'
				}
				that.conv = res.conversation
				that.messages = res.messages
				uni.setNavigationBarTitle({
					title: that.conv.name ?? '会话'
				})
				// console.log(that.messages[that.messages.length - 1])
				that.scrollToBottom()
				// if (that.messages[that.messages.length - 1]) {
				// 	that.play(that.messages[that.messages.length - 1])
				// }

			})


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
			translate(message) {
				if (!message.translate) {
					utils.request('POST', '/api/translate', {
						source: message.content
					}, (res) => {
						// console.log(res)
						message.translate = res.translate
					})
				}

			},
			cleanUp() {
				innerAudioContext.stop();
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
				var that = this
				utils.request('GET', '/api/lookup', {
					word
				}, (res) => {
					// console.log(res)
					that.dict = res.dict
					that.$refs.dictionary.open()
				})
			},
			switchPlay(message) {
				if (message.playing) {
					message.playing = false
					innerAudioContext.stop()
				} else {
					this.play(message)
				}
			},
			play(cd) {
				innerAudioContext.go(cd)
			},
			handleRecordStart() {
				innerAudioContext.stop()

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
			collect(dict) {
				if (!utils.getUser()) {
					utils.loginFirst()
					return;
				}
				utils.request('POST', '/api/collection', {dict_id: dict.id, word: dict.word}, (res) => {
					dict.is_collected = true
					uni.showToast({
						title: '加入单词本'
					})
				})
			},
			uncollect(dict) {
				if (!utils.getUser()) {
					utils.loginFirst()
					return;
				}
				utils.request('POST', '/api/collection/delete', {dict_id: dict.id}, (res) => {
					dict.is_collected = false
					uni.showToast({
						title: '从单词本删除'
					})
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
					if (res.error == 0) {
						// let message = res.message
						// message.words = message.content.split(/([\.\?, ])/).filter(item => item !== '')
						// console.log(message.words)
						that.messages.push(res.message)
						that.play(that.messages[that.messages.length - 1])
						that.scrollToBottom()
						that.status = 'none'
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