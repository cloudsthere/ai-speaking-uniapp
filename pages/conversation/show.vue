<template>
	<view class="content">
		<template v-for="message in messages" :key="message.id">
			<view class="session ai-session text-gray-600" v-if="message.role == 'assistant'">
				<!-- <image class="avatar" :src="conv.avatar" mode=""></image> -->
				<view class="message-box">
					<!-- <view class="message-text">{{message.content}}</view> -->
					<view class="message-text">

						<words :words="message.words" @lookup="lookup"></words>

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
						<view class="flex" v-show="message.recommends"
							v-for="(recommend, recommend_index) in message.recommends" :key="recommend_index">
							<span class="px-1 text-blue-500">•</span>
							<view>
								<words :words="recommend" @lookup="lookup"></words>
							</view>
						</view>
						<view class="text-center" v-show="!message.recommends">
							<view class="animate-spin">
								<!-- <image src="@/static/icon-loading.png" mode="" class="w-5 h-5"></image> -->
							</view>
						</view>
					</view>
				</view>
				<view class="placeholder"></view>
			</view>
			<view class="session user-session text-gray-600" v-if="message.role == 'user'">
				<!-- <image class="avatar" src="@/static/user-avatar.png" mode=""></image> -->
				<view class="message-box">
					<view class="message-text">
						<!-- <words :words="message.words" @lookup="lookup"></words> -->
						{{message.content}}
					</view>

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
			<!-- <image class="avatar" :src="conv.avatar" mode=""></image> -->
			<view class="message-box twinkling">
				<view class="message-text">思考中...</view>
			</view>
			<view class="placeholder"></view>
		</view>
		<view class="session user-session recording" v-show="status == 'recording'">
			<!-- <image class="avatar" src="@/static/user-avatar.png" mode=""></image> -->

			<view class="message-box twinkling">
				<view class="message-text">
					{{current_content ? current_content : '收听中...'}}
				</view>
			</view>
			<view class="placeholder"></view>
		</view>
		<view class="text-center text-gray-600 mt-4" v-if="status == 'halt'">
			<text>课时不足，请</text>
			<navigator url="/pages/home/price" class="text-primary inline">购买会员→</navigator>
		</view>
		<view class="text-center text-gray-600 mt-4" v-if="status == 'end'">
			本次会话已结束
		</view>
	</view>
	<view class="dashboard bg-gray-100 ">
		<view class="text-center mb-2 text-sm text-gray-600" v-if="mode == 'phone'">
			<view>
				<!-- <uni-icons custom-prefix="iconfont" type="icon-maikefeng" size="20"></uni-icons> -->
				<uni-icons custom-prefix="iconfont" type="icon-maikefeng" size="16"></uni-icons>
				<text v-show="phone_status == 'listening'">收听中...</text>
				<text v-show="phone_status == 'speaking'">AI说...</text>
			</view>
		</view>
		<view class="flex items-center gap-2 px-2">
			<uni-icons @click="switchMode" type="plusempty" size="16"></uni-icons>
			<view class="button-wapper">
				<button class="btn-speak text-gray-400" v-if="status == 'end'">已结束</button>
				<button class="btn-speak btn-danger" v-else-if="mode == 'phone'" @click="hangUp">挂断</button>
				<button class="btn-speak bg-white" v-else-if="mode == 'chat'" @longpress="handleRecordStart" @touchend="handleRecordStop">按住
					说话</button>
				<input v-else-if="mode == 'keyboard'" type="text" v-model="text" class="py-2 border-b border-x-0 border-t-0 text-left border-gray-200 border-solid bg-white"/>
			</view>
			<uni-icons v-if="mode == 'chat'" @click="call" :class="{}" custom-prefix="iconfont" type="icon-maikefeng" size="40"></uni-icons>
			<uni-icons v-else-if="mode == 'keyboard'" @click="sendText" type="paperplane-filled" size="16"></uni-icons>
		</view>
	</view>
	<dictionary ref="dictionary"></dictionary>
	<image src="@/static/search-color.png" class="fixed bottom-32 right-4 z-10 w-6 h-6" @click="showSearch"></image>
</template>

<script>
	import utils from '@/common/utils.js';
	import player from '@/common/player.js';
	import base64 from '@/common/base64.js';
	import dictionary from '../component/dictionary.vue';
	import words from '../component/words.vue';
	import CryptoJS from 'crypto-js';

	// const recorderManager = uni.getRecorderManager();
	// const innerAudioContext = utils.createInnerAudioContext()
	const APPID = "abb0f990";
	const API_SECRET = "MzYzZjM2OGQ2NWU0ZTI4YjdmODNlYTNh";
	const API_KEY = "ca3a1899fffbe04843f348fcdf77e12b";
	const recorder_duration = 60000

	var iatParams = function(status, audio) {
		var params = {
			common: {
				app_id: APPID
			},
			business: {
				domain: "iat",
				// language: 'zh_cn',
				language: 'en_us',
				accent: "mandarin",
				dwa: "wpgs",
				// vad_eos: 10000
				vad_eos: 2000
			},
			data: {
				status: status,
				format: "audio/L16;rate=16000",
				// encoding: "raw",
				encoding: "lame",
				audio: audio
			}
		}
		// console.log('params')
		// console.log(params)
		return JSON.stringify(params)
	}

	var geturl = function(appid, apisecret, apikey) {

		var url = 'wss://iat-api.xfyun.cn/v2/iat'
		var algorithm = 'hmac-sha256'
		var headers = 'host date request-line'
		/* 生成时间 */
		var a = Number(new Date().getTime()) - 28800000
		var b = String(new Date(a)).split(' ')
		var time = b[0] + ',' + ' ' + b[2] + ' ' + b[1] + ' ' + b[3] + ' ' + b[4] + ' ' + 'GMT'
		/* 生成signature_origin */
		const signature_origin = "host: " + "iat-api.xfyun.cn" + "\n" + "date: " + time + "\n" + "GET /v2/iat HTTP/1.1"
		/* 哈希加密 */
		var signatureSha = CryptoJS.HmacSHA256(signature_origin, apisecret)
		// console.log(typeof (signatureSha))
		var signature = CryptoJS.enc.Base64.stringify(signatureSha)
		// console.log(signature)
		var authorizationOrigin =
			`api_key="${apikey}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`
		/* base64编码 */
		var authorization = base64.btoa(authorizationOrigin)
		var v = 'authorization=' + authorization + "&date=" + time + "&host=iat-api.xfyun.cn"
		var url = `${url}?` + v
		// console.log(encodeURI(url))
		return encodeURI(url)
	}

	export default {
		components: {
			dictionary,
			words,
		},
		data() {
			return {
				// none: 没有情况，recording: 用户录音，thinking: AI思考中，思考完后又回到none， halt:没钱停机，end: 已结束
				status: 'none',
				// chat: 对话，phone: 电话, keyboard: 键盘
				mode: 'chat',
				// speaking, listening
				phone_status: 'none',
				// status: 'thinking', //
				conv: {},
				messages: [],
				recording: false,
				recoManager: null,
				voice_file: null,
				question: '',
				tik: null,
				dialog_id: null,
				dict: null,
				// current_content: 'Hi, annie. Long time no see, I miss you so much. Do you miss me?',
				current_content: '',
				current_audio_file: null,
				socket_status: 'none',
				hangingUp: false,
				text: '',
				// playing_message: null,
			}
		},
		onLoad(options) {
			// console.log(options)
			var that = this


			uni.authorize({
				scope: 'scope.record',
				success() {
					console.log('onLoad 已有权限')
				},
				fail() {
					console.log('onLoad 没有权限，应去授权')
					uni.showModal({
						// title: '提示',
						title: '请先授权麦克风',
						// content: '这是一个模态弹窗',
						success: function(res) {
							if (res.confirm) {
								// console.log('用户点击确定');
								uni.openSetting()
							} else if (res.cancel) {
								// console.log('用户点击取消');
							}
						}
					});
					// uni.showToast({
					// 	title: '请先授权麦克风',
					// 	complete() {
					// 		uni.openSetting()
					// 	}
					// })
				}
			})

			var method = 'GET'
			var url = '/api/conversation/' + options.conv_id
			var data = {}
			if (options.scene_id) {
				method = 'POST'
				url = '/api/conversation/'
				data = {
					scene_id: options.scene_id,
				}
			}
			
			utils.request(method, url, data, (res) => {
				console.log(res)
				// if (res.conversation.end) {
				// 	that.status = 'end'
				// } else if (res.halt) {
				// 	that.status = 'halt'
				// }
				that.conv = res.conversation
				// that.messages = [res.message]
				that.messages = res.messages
				// console.log(that.messages[0])
				
				uni.setNavigationBarTitle({
					title: that.conv.name ?? '会话'
				})
				// console.log(that.messages[that.messages.length - 1])
				that.scrollToBottom()
				// if (that.messages[that.messages.length - 1]) {
				// 	that.play(that.messages[that.messages.length - 1])
				// }
				if (that.messages.length == 0) {
					that.status = 'thinking'
					utils.request('POST', '/api/message', {
						conv_id: that.conv.id
					}, (res) => {
						// console.log(res)
						that.status = 'none'
						that.messages.push(res.message)
						// console.log(that.messages[0])
						that.play(that.messages[0])
					})
				} else {
					that.play(that.messages[that.messages.length - 1])
				}
			})





		},
		onShow() {
			// this.createDialog()
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
			switchMode() {
				if (this.mode == 'chat') {
					this.mode = 'keyboard'
				} else {
					this.mode = 'chat'
				}
			},
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
						// console.log(message)
						// 最后一个message
						if (message.id == that.messages[that.messages.length - 1].id) {
							// console.log('last message')
							that.scrollToBottom()
						}
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
				// this.handleRecordStop()
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
			lookup(word) {
				// console.log(word)
				// var that = this
				// this.$refs.dictionary.showSearch()
				this.$refs.dictionary.search(word)

			},
			showSearch() {
				this.$refs.dictionary.showSearch()
			},
			turnNotice() {
				// console.log(utils.domain + '/static/turn-notice.mp3')
				player.sound(utils.domain + '/static/turn-notice.mp3')
			},
			switchPlay(message) {
				player.switchPlay(message)
			},
			play(cd) {
				// innerAudioContext.go(cd)
				player.play(cd)
			},
			startRecorderManager() {
				this.initRecorderManager()
				const options = {
					// 2分钟
					duration: recorder_duration,
					sampleRate: 16000,
					numberOfChannels: 1,
					format: 'mp3',
					frameSize: 1.28,
				}
				this.RecorderManager.start(options)
			},
			hangUp() {
				this.RecorderManager.stop()
				this.mode = 'chat'
				this.phone_status = 'none'
				this.status = 'none'
				this.hangingUp = true;
			},
			call() {
				if (this.mode == 'phone' && this.phone_status == 'listening') {
					return;
				}

				console.log('call')
				this.mode = 'phone'
				this.phone_status = 'listening'
				this.status = 'recording'
				this.startRecord()
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
						// console.log('getSetting', res.authSetting)
						if (!res.authSetting['scope.record']) {
							uni.showModal({
								// title: '提示',
								title: '请先授权麦克风',
								// content: '这是一个模态弹窗',
								success: function(res) {
									if (res.confirm) {
										// console.log('用户点击确定');
										uni.openSetting()
									} else if (res.cancel) {
										// console.log('用户点击取消');
									}
								}
							});
							// uni.showToast({
							// 	title: '请先授权麦克风',
							// 	complete() {
							// 		uni.openSetting()
							// 	}
							// })
						} else {
							console.log('record start')
							that.startRecord()

							that.status = 'recording'
						}
					}
				})
			},
			startRecord() {
				var that = this

				var url = geturl(APPID, API_SECRET, API_KEY)
				// console.log(url)
				// var status = 2
				this.socket = uni.connectSocket({
					url: url,
					method: "GET",
				})


				// console.log('socket')
				// for (let i in this.socket) {
				// 	console.log(i)
				// }

				uni.onSocketOpen(function() {
					console.log('合成链接已打开')
					that.socket_status = 'connected'
					uni.sendSocketMessage({
						data: iatParams(0)
					})

					that.startRecorderManager()
				})
				uni.onSocketError(function(errMsg) {
					that.socket_status = 'error'
					console.log('websocket合成链接打开失败')
					console.log(errMsg)
				})

				let resultTextTemp = ''
				let resultText = '';

				uni.onSocketMessage(function(res) {
					// console.log('receive socket message')
					// console.log(res)
					// console.log(JSON.parse(res.data))
					// renderResult(res.data)
					let jsonData = JSON.parse(res.data);
					// console.log(jsonData)

					if (jsonData.data && jsonData.data.result) {
						let data = jsonData.data.result;
						let str = "";
						let ws = data.ws;
						for (let i = 0; i < ws.length; i++) {
							str = str + ws[i].cw[0].w;
						}
						// 开启wpgs会有此字段(前提：在控制台开通动态修正功能)
						// 取值为 "apd"时表示该片结果是追加到前面的最终结果；取值为"rpl" 时表示替换前面的部分结果，替换范围为rg字段
						if (data.pgs) {
							if (data.pgs === "apd") {
								// 将resultTextTemp同步给resultText
								resultText = resultTextTemp;
							}
							// 将结果存储在resultTextTemp中
							resultTextTemp = resultText + str;
						} else {
							resultText = resultText + str;
						}
						let text = resultTextTemp || resultText || "";
						// console.log('result', text)
						that.current_content = text
					}
					if (jsonData.code === 0 && jsonData.data.status === 2) {
						console.log('socket code close')
						// iatWS.close();
						that.RecorderManager.stop();
						uni.closeSocket()

						if (!that.hangingUp) {
							let sil = setInterval(() => {
								if (that.current_audio_file) {
									clearInterval(sil)
									that.sendMessage()
									// if (that.mode == 'phone' && that.phone_status == 'listening') {
									// 	that.phone_status = 'speaking'
									// }
								}
							}, 100)
						} else {
							that.hangingUp = false
						}
					}
					if (jsonData.code !== 0) {
						// iatWS.close();
						console.log('socket code not 0')
						console.error(jsonData);
					}
				})

				uni.onSocketClose((res) => {
					that.socket_status = 'close'
					console.log('socket close')
					// that.status = 'none'
				})





				// if (!this.recoManager) {
				// console.log('创建recoManager')
				// var plugin = requirePlugin("WechatSI")
				// 	this.recoManager = plugin.getRecordRecognitionManager()
				// 	this.recoManager.onRecognize = function(res) {
				// 		console.log("current result", res.result)
				// 		that.current_content = res.result
				// 	}
				// 	this.recoManager.onStop = function(res) {
				// 		console.log('record stop')
				// 		console.log("record file path", res.tempFilePath)
				// 		console.log("content", res.result)
				// 		// that.scrollToBottom()

				// 		// TODO
				// 		res.result = 'hi, I am Allen. Nice to meet you';

				// 		if (!res.result) {
				// 			uni.showToast({
				// 				title: '未能识别，请再试',
				// 				icon: 'none'
				// 			})
				// 			that.status = 'none'
				// 			return
				// 		}
				// 		that.sendMessage(res.result, res.tempFilePath)
				// 	}
				// 	this.recoManager.onStart = function(res) {
				// 		console.log("成功开始录音识别", res)
				// 	}
				// 	this.recoManager.onError = function(res) {
				// 		console.error("error msg", res)
				// 		uni.showToast({
				// 			title: '语音识别出错，请再试',
				// 			icon: 'none'
				// 		})
				// 		that.status = 'none'
				// 	}
				// }
				// that.recoManager.start({
				// 	lang: "en_US"
				// })
			},
			initRecorderManager() {
				if (!this.RecorderManager) {
					var that = this;
					this.RecorderManager = uni.getRecorderManager()
					// console.log('ws链接打开成功，开始录音')

					this.RecorderManager.onStart((res) => {
						that.recorder_status = 'recording'
					})

					this.RecorderManager.onStop((res) => {
						// console.log(res.duration)
						if (res.duration >= recorder_duration - 1000) {
							that.recorder_status = '超时结束'
						} else {
							that.recorder_status = 'stop'
						}
						// console.log('close recorder')
						// that.sendMessage(res.tempFilePath)
						console.log('assign audio file')
						that.current_audio_file = res.tempFilePath
					})

					this.RecorderManager.onFrameRecorded(function(res) {
						// console.log('frame recorded')
						// console.log(res.frameBuffer, res.isLastFrame)
						// console.log(this.data.first_status)
						// if (that.first_status) {
						// 	var status = 0
						// 	that.first_status = false
						// } else {
						// 	var status = 1
						// }
						// console.log('readyState', that.socket.readyState)
						// if (that.socket.readyState != WebSocket.OPEN) {
						// 	console.log('socket not ready, return')
						// 	return;
						// }

						if (that.socket_status == 'connected') {
							let status = res.isLastFrame ? 2 : 1
							if (res.isLastFrame) {
								console.log('last frame')
							}

							// uni.socket_status
							// console.log(wx.arrayBufferToBase64(res.frameBuffer))
							// console.log(utils.iatParams(status, utils.toBase64(res.frameBuffer)))

							// socked已断开而recorder未关闭会导致报错
							uni.sendSocketMessage({
								data: iatParams(status, uni.arrayBufferToBase64(res.frameBuffer)),
								fail: (res) => {
									console.log('send socket message fail', res)
								}
							})


						}

					})
				}
			},
			handleRecordStop() {
				console.log('handle record stop')
				// this.recording = false
				// for (let i in this.recoManager) {
				// 	console.log(i)
				// }
				// 有可能未初始化
				if (this.RecorderManager) {
					this.RecorderManager.stop()
				}
			},
			scrollToBottom: function() {
				setTimeout(() => {
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
				}, 100)
				
			},

			sendText() {
				console.log(this.text)
				if (this.text.length == 0) {
					return;
				}
				
				this.messages.push({
					role: 'user',
					content: this.text,
					// audio_url: this.current_audio_file
				})
				this.scrollToBottom()
				
				this.status = 'thinking'
				var that = this
				
				utils.request('POST', '/api/message', {
					content: that.text,
					conv_id: that.conv.id,
					// audio: audio_str,
				}, (res) => {
					that.current_content = null
					that.text = null
					that.current_audio_file = null
				
					if (res.error == 0) {
						// let message = res.message
						// message.words = message.content.split(/([\.\?, ])/).filter(item => item !== '')
						// console.log(message.words)
						that.messages.push(res.message)
						let context = player.play(that.messages[that.messages.length - 1])
						// console.log('context', context)
						console.log('mode', that.mode);
						console.log('phone_status', that.phone_status);
						if (that.mode == 'phone') {
							that.phone_status = 'speaking'
							that.status = 'none'
							console.log('status phoning & speaking')
							context.onEnded((res) => {
								console.log('player ended')
								context.offEnded()
								that.turnNotice()
								that.call()
							})
						} else {
							if (res.end) {
								that.status = 'end'
							} else {
								that.status = 'none'
							}
						}
				
						that.scrollToBottom()
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
			sendMessage() {
				var that = this

				// this.current_content = 'Hi, my name is Allen';

				if (!this.current_content) {
					uni.showToast({
						title: '未识别内容，请重试',
						icon: 'none'
					})
					this.status = 'none'
					return;
				}

				// if (this.mode == 'phone') {
				// 	this.turnNotice()
				// }

				this.messages.push({
					role: 'user',
					content: this.current_content,
					audio_url: this.current_audio_file
				})
				this.scrollToBottom()

				this.status = 'thinking'


				// console.log('read current_audio_file', this.current_audio_file)
				// 读取文件内容并进行Base64编码
				uni.getFileSystemManager().readFile({
					filePath: this.current_audio_file,
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
							content: that.current_content,
							conv_id: that.conv.id,
							audio: audio_str,
						}, (res) => {
							that.current_content = null
							that.current_audio_file = null

							if (res.error == 0) {
								// let message = res.message
								// message.words = message.content.split(/([\.\?, ])/).filter(item => item !== '')
								// console.log(message.words)
								that.messages.push(res.message)
								let context = player.play(that.messages[that.messages.length - 1])
								// console.log('context', context)
								console.log('mode', that.mode);
								console.log('phone_status', that.phone_status);
								if (that.mode == 'phone') {
									that.phone_status = 'speaking'
									that.status = 'none'
									console.log('status phoning & speaking')
									context.onEnded((res) => {
										console.log('player ended')
										context.offEnded()
										that.turnNotice()
										that.call()
									})
								} else {
									if (res.end) {
										that.status = 'end'
									} else {
										that.status = 'none'
									}
								}

								that.scrollToBottom()
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
			justify-content: flex-start;
		}
	}


	.recording {
		.message-box {
			// flex: 1;
			// min-width: 60px;
		}
	}



	.dashboard {
		position: fixed;
		padding-bottom: 20px;
		bottom: 0;
		right: 0;
		left: 0;

		.placeholder {
			width: 40px;
			flex: none;
		}

		.button-wapper {
			width: 80%;
		}

		.btn-speak {
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