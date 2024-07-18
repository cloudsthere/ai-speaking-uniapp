<template>
	<view class="w-full hp100" :style="{paddingBottom: bottom + 'rpx'}">
		<view class="content" :style="{paddingBottom: (bottom + 224) + 'rpx'}">
			<template v-for="message in messages" :key="message.id">
				<view class="c-gray-1 text-center fs-22">{{message.date}}</view>
				<view class="session ai-session" v-if="message.role == 'assistant'">
					<image @click="toSetting" class="avatar rounded-lg" :src="agent.avatar" />

					<view class="message-box assistant-box">
						<view class="message-text c-blue-1 fs-30">

							<words :text="message.content" @lookup="(w) => lookup(w, message)"></words>

						</view>
						<view class="message-dashboard">
							<view>
								<image v-if="message.addition === 'translate'" @tap="translate(message)"
									class="w-40 mr-32" src="/static/icon-translate-selected.svg" />
								<image v-else @tap="translate(message)" class="w-40 mr-32"
									src="/static/icon-translate-normal.svg" />
								<image v-if="message.addition === 'recommend'" @tap="recommend(message)" class="w-40"
									src="/static/icon-aireply-selected.svg" />
								<image v-else class="w-40" @tap="recommend(message)"
									src="/static/icon-aireply-normal.svg" />
							</view>
							<image v-if="message.playing" @tap="switchPlay(message)" class="w-40"
								src="/static/icon-play.png" />
							<image v-else @tap="switchPlay(message)" class="w-40" src="/static/icon-play.svg" />
						</view>
						<view class="addition" v-show="message.addition == 'translate'">
							{{message.translate}}
						</view>
						<view class="addition" v-show="message.addition == 'recommend'">
							<view v-if="message.recommend">
								<words :text="message.recommend.content" @lookup="lookup"></words>
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
				<view class="session user-session" v-if="message.role == 'user'">
					<image class="avatar rounded-lg" :src="user.avatar ?? '/static/default_avatar.jpg'" mode=""></image>
					<view class="message-box user-box flex-auto">
						<view class="message-text c-blue-1 fs-30">
							<!-- <words :words="message.words" @lookup="lookup"></words> -->
							{{message.content}}
						</view>

						<view class="message-dashboard justify-between">
							<template v-if="message.audio || message.audio_file">
								<image v-if="message.playing" @tap="switchPlay(message)" class="w-40"
									src="/static/icon-replay-playing.svg" />
								<image v-else @tap="switchPlay(message)" class="w-40"
									src="/static/icon-replay-normal.svg" />
							</template>
							<view v-else class="placeholder"></view>
							<image v-show="message.reading" @tap="switchPlay(message, 'reading')" class="w-40"
								src="/static/icon-play.png" />
							<image v-show="!message.reading" @tap="switchPlay(message, 'reading')" class="w-40"
								src="/static/icon-play.svg" />
						</view>
					</view>
					<view class="placeholder"></view>
				</view>
			</template>
			<view class="session ai-session" v-if="status == 'thinking'">
				<image class="avatar rounded-lg" :src="agent.avatar" />
				<view class="message-box twinkling">
					<view class="message-text">...</view>
				</view>
				<view class="placeholder"></view>
			</view>
			<view class="text-center mt-4" v-if="status == 'end'">
				本次会话已结束
			</view>
		</view>
		<view class="dashboard event-none">
			<view class="mb-24 p-h-32 gap-16 event-auto" style="display: inline-flex;">
				<!--
				<navigator :url="'/pages/conversation/setting?conv_id=' + conv.id" class="extra-btn fs-26">
					<image src="/static/emoji-setting.png" style="width: 26rpx; height: 26rpx" /> 设置
				</navigator>
				-->

				<view class="extra-btn fs-26" @click="showSearch">
					<image src="/static/emoji-search.png" style="width: 26rpx; height: 26rpx" /> 查词
				</view>
			</view>
			<view v-if="status === 'recording'"
				class="event-auto flex items-center input-bottom bg-white recording justify-center gap-24">
				<image src="/static/voice-effect.png" style="width: 80rpx; height: 80rpx" /> 松手发送
			</view>

			<view v-else-if="mode === 'chat'" class="event-auto flex items-center input-bottom bg-white">
				<image @tap="call" class="no-shrink" style="width: 56rpx; height: 56rpx" src="/static/icon-phone.svg" />
				<view class="button-wapper flex-auto">
					<view class="btn-speak border-none c-blue-1 font-semibold fs-32" @touchstart="handleRecordStart"
						@touchend="handleRecordStop">按住说话</view>
				</view>
				<image @tap="switchMode" class="no-shrink" style="width: 56rpx; height: 56rpx"
					src="/static/icon-keyboard.svg" />
			</view>

			<view v-else class="event-auto flex items-center input-bottom bg-white">
				<view class="button-wapper flex-auto">
					<textarea auto-height @keyup.enter="sendText" type="text" :value="text" @input="handleInput"
						placeholder="发消息..." class="fs-28 keyboard-text" />
				</view>
				<image v-if="!!text" @tap="sendText" class="no-shrink" style="width: 56rpx; height: 56rpx"
					src="/static/icon-send.svg" />
				<image v-else @tap="switchMode" class="no-shrink" style="width: 56rpx; height: 56rpx"
					src="/static/icon-voice.svg" />
			</view>

			<view class="bg-white" :style="{paddingBottom: bottom + 'rpx'}"></view>
		</view>
	</view>
	<dictionary ref="dictionary"></dictionary>
	<telephone-link v-if="mode === 'phone'" v-model="phone_status" :status="status" :avatar="agent.avatar"
		@hangUp="hangUp" />
	<tui-modal v-if="status == 'halt'" :show="status == 'halt'" custom padding="64rpx 80rpx 32rpx" width="604rpx"
		radius="32rpx">
		<view class="flex flex-col items-center lh-56">
			<text class="c-blue-1 fs-32 font-semibold">课时已使用完啦</text>
			<text class="c-blue-1 fs-32 font-semibold">升级Pro会员，畅享AI无限对话</text>

			<navigator url="/pages/home/price" class="upgrade flex items-center justify-center c-white">
				立即升级
			</navigator>

			<text class="fs-24 c-gray-1" @tap="goBack">暂时不用</text>
		</view>
	</tui-modal>
</template>

<script>
	import utils from '@/common/utils.js';
	import player from '@/common/player.js';
	import base64 from '@/common/base64.js';
	import dictionary from '../component/dictionary.vue';
	import telephoneLink from '../component/telephoneLink.vue'
	import tuiModal from "@/components/thorui/tui-modal/tui-modal.vue"
	import words from '../component/words.vue';
	import CryptoJS from 'crypto-js';

	const APPID = "abb0f990";
	const API_SECRET = "MzYzZjM2OGQ2NWU0ZTI4YjdmODNlYTNh";
	const API_KEY = "ca3a1899fffbe04843f348fcdf77e12b";
	const recorder_duration = 60000
	const innerAudioContext = uni.createInnerAudioContext({
		obeyMuteSwitch: false,
	});

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
				vad_eos: 3000
			},
			data: {
				status: status,
				format: "audio/L16;rate=16000",
				encoding: "lame",
				audio: audio
			}
		}
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
			telephoneLink,
			tuiModal
		},
		data() {
			return {
				// none: 没有情况，recording: 用户录音，thinking: AI思考中，思考完后又回到none， halt:没钱停机，end: 已结束
				status: 'none',
				// chat: 对话，phone: 电话, keyboard: 键盘
				mode: 'chat',
				// mode: 'keyboard',
				// speaking, listening
				phone_status: 'none',
				conv: {
					avatar: ''
				},
				messages: [],
				agent: {},
				// recording: false,
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
				audioCtx: null,
				audioSource: null,
				user: utils.getUser(),
				bottom: getApp().globalData.safeBottom,

				cd: {},
				conv_id: "",
			}
		},
		onLoad(options) {
			// console.log(options)
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

			this.audioCtx = wx.createWebAudioContext()
			this.audioSource = this.audioCtx.createBufferSource()
			this.options = options


		},
		onShow() {
			this.init()
		},
		onHide() {
			this.cleanUp()
		},
		onUnload() {
			this.stopPlay()
			this.cleanUp()
		},
		onShareAppMessage(res) {
			return utils.share()
		},
		onShareTimeline(res) {
			return utils.share()
		},
		methods: {
			init() {
				var method = 'POST'
				var url = '/api/conversation/'

				let data = {
					agent_id: this.options.agent_id,
					conv_id: this.options.conv_id,
				}
				// console.log(data)

				var that = this
				utils.request(method, url, data, (res) => {
					// console.log(res)
					this.conv = res.conversation
					// that.messages = [res.message]
					const timeline = res.timeline
					if (timeline.length > 0) {
						let nextId = timeline[0].start_message_id
						let sectionIndex = -1
						let i = 0
						while (i < res.messages.length) {
							const item = res.messages[i]
							if (item.id === nextId) {
								sectionIndex++
								item.date = timeline[sectionIndex].date
								nextId = sectionIndex + 1 < timeline.length ? timeline[sectionIndex + 1]
									.start_message_id : 0
							}
							i++
						}
					}

					this.messages = res.messages
					this.agent = res.agent
					// console.log(this.messages)
					// console.log(that.messages[0])

					uni.setNavigationBarTitle({
						title: this.agent.name ?? '会话'
					})
					// console.log(that.messages[that.messages.length - 1])
					this.scrollToBottom()

					if (this.messages.length == 0) {
						this.status = 'thinking'
						this.generateMessage()
					} else {
						if (this.options.mode == 'phone') {
							// that.call()
							this.mode = 'phone'
							this.phone_status = 'listening'
							that.status = 'recording'
							// this.play(this.messages[this.messages.length - 1], () => {
							// 	this.call()
							// })
							that.startRecord()
						} else {
							// this.play(this.messages[this.messages.length - 1])

						}
					}


				})
			},
			switchMode() {
				if (this.mode == 'chat') {
					this.mode = 'keyboard'
				} else {
					this.mode = 'chat'
				}
			},
			toSetting() {
				uni.navigateTo({
					url: '/pages/conversation/setting?conv_id=' + this.conv.id
				})
			},
			recommend(message) {
				if (message.addition === 'recommend') {
					return message.addition = null
				}
				if (!message.recommends) {
					var that = this
					utils.request('POST', '/api/recommend', {
						// source: message.content
						conv_id: this.conv.id,
						message_id: message.id
					}, (res) => {
						// console.log(res)
						message.recommend = res.recommend
						console.log(message)
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
				if (message.addition === 'translate') {
					return message.addition = null
				}
				if (!message.translate) {
					utils.request('POST', '/api/translate', {
						source: message.content
					}, (res) => {
						// console.log(res)
						message.translate = res.translate
					})
				}
				message.addition = 'translate'
				console.log(this.messages)
			},
			cleanUp() {
				// this.handleRecordStop()
				this.stopPlay();
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
			cancelFilter(m) {
				if (m.filter) {
					return m.filter = false
				}
			},
			lookup(word, m) {
				// console.log(word)
				// var that = this
				// this.$refs.dictionary.showSearch()
				if (m) {
					if (m.filter) {
						return m.filter = false
					}
				}
				this.$refs.dictionary.search(word)

			},
			showSearch() {
				this.$refs.dictionary.showSearch()
			},
			turnNotice(callback) {
				console.log(utils.domain + '/static/turn-notice.mp3')
				console.log('turn notice')
				innerAudioContext.src = utils.domain + '/static/turn-notice.mp3'
				innerAudioContext.onEnded(() => {
					console.log('播放完成')
					if (callback) {
						callback()
						innerAudioContext.offEnded()
					}
				})
				innerAudioContext.play()
			},
			// switchPlay(message) {
			// 	player.switchPlay(message)
			// },
			switchPlay(message, key = 'playing', callback) {
				console.log('switch play', message, key)
				if (message[key]) {
					innerAudioContext.stop()
					message[key] = false
				} else {
					this.stopPlay()
					message[key] = true
					let src;
					if (key == 'playing') {
						console.log('audio_file', message.audio_file)
						console.log('audio_file', message.audio)
						// 本地文件优先，mp3文件url次之，动态生成再次
						src = message.audio_file || message.audio || (utils.domain + `/api/message/${message.id}/audio`)
					} else if (key == 'reading') {
						src = message.read || (utils.domain + `/api/message/${message.id}/audio?field=read`)
					}
					console.log('src', src)
					innerAudioContext.src = src
					innerAudioContext.onPlay(() => {
						console.log('开始播放');
					});
					innerAudioContext.onEnded(() => {
						console.log('播放完成')
						message[key] = false
						if (callback) {
							callback()
							innerAudioContext.offEnded()
						}
					})
					innerAudioContext.onError((res) => {
						console.log(res.errMsg);
						console.log(res.errCode);
					});
					innerAudioContext.play()

				}
			},
			stopPlay() {
				for (let m of this.messages) {
					m.playing = false
					m.reading = false
				}
				innerAudioContext.stop()
			},
			switchPlay1(message) {
				if (message.playing) {
					message.playing = false
					message.filter = false
				} else {
					this.play(message)
				}
			},
			aiPlay1(message) {
				this.stopPlay()
				if (message.aiPlaying) {
					message.aiPlaying = false
					message.filter = false
					return
				}
				if (message.read) {
					message.aiPlaying = true
					message.filter = true
					this.cd = message
					return player.sound(message.read, () => {
						message.aiPlaying = false
						message.filter = false
					})
				}

				utils.request('GET', '/api/message/' + message.id + '/read', null, (res) => {
					message.aiPlaying = true
					message.filter = true
					this.cd = message
					player.sound(res.read, () => {
						message.aiPlaying = false
						message.filter = false
					})
				})
			},
			stopPlay1() {
				this.cd.playing = false
				// this.cd.filter = false
				if (this.cd.aiPlaying) {
					this.cd.aiPlaying = false
				}
				player.stop()
				this.audioSource.stop()
			},
			play1(cd, callback) {
				// console.log(cd)
				if (this.cd.playing || this.cd.aiPlaying) {
					// console.log('stop')
					this.stopPlay()
				}
				let that = this
				this.cd = cd
				cd.playing = true
				cd.filter = true
				// console.log('cd', cd)
				if (cd.audio_file) {
					let context = uni.createInnerAudioContext({
						obeyMuteSwitch: false,
					});
					context.src = cd.audio_file
					context.onEnded(() => {
						context.offEnded()
						cd.playing = false
						// cd.filter = false
					})
					context.play()

				} else {
					let url = utils.domain + `/api/message/${cd.id}/audio`
					// console.log('play url', url)
					this.loadAudio(url).then(buffer => {
						this.audioSource = this.audioCtx.createBufferSource()
						that.audioSource.buffer = buffer
						that.audioSource.connect(that.audioCtx.destination)
						that.audioSource.start()

						that.audioSource.onended = () => {
							cd.playing = false
							// cd.filter = false
							console.log('play ended', cd)
							if (callback) {
								console.log('play callback')
								callback()
							}
							that.audioSource.onended = () => {}
						}

					}).catch((e) => {
						console.log('play fail', e)
						this.stopPlay()
					})

				}
			},
			loadAudio(url) {
				var that = this
				return new Promise((resolve, reject) => {
					wx.request({
						url,
						responseType: 'arraybuffer',
						success: res => {
							console.log('res.data', res.data)
							that.audioCtx.decodeAudioData(res.data, buffer => {
								console.log('decode success')
								resolve(buffer)
							}, err => {
								console.error('decodeAudioData fail', err)
								reject()
							})
						},
						fail: res => {
							console.error('request fail', res)
							reject()
						}
					})
				})
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
				if (this.RecorderManager) {
					this.RecorderManager.stop()
				}
				this.mode = 'chat'
				this.phone_status = 'none'
				this.status = 'none'
				this.hangingUp = true;
			},
			call() {
				this.stopPlay()
				if (this.mode == 'phone' && this.phone_status == 'listening') {
					return;
				}

				// console.log('call')
				this.mode = 'phone'
				this.phone_status = 'listening'
				this.status = 'recording'
				this.startRecord()
			},
			handleRecordStart() {
				this.stopPlay()

				if (this.status == 'halt') {
					uni.showToast({
						title: '课时不足，请先购买会员',
						icon: 'none'
					})
					return;
				}

				// 先取得权限
				uni.getSetting({
					success: (res) => {
						if (!res.authSetting['scope.record']) {
							uni.showModal({
								title: '请先授权麦克风',
								success: function(res) {
									if (res.confirm) {
										uni.openSetting()
									} else if (res.cancel) {}
								}
							});
						} else {
							console.log('record start')

							this.status = 'recording'
							this.startRecord()
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
						console.log('result', text)
						that.current_content = text
					}
					if (jsonData.code === 0 && jsonData.data.status === 2) {
						console.log('socket code close')
						// iatWS.close();
						that.RecorderManager.stop();
						uni.closeSocket()
						// that.sendMessage()

						if (!that.hangingUp) {
							// 等待recorderManager结束
							let sil = setInterval(() => {
								if (that.current_audio_file) {
									console.log('send message at sockect end')
									clearInterval(sil)
									that.sendMessage()
									
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
						that.status = 'none'
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
					console.log('ws链接打开成功，开始录音')

					this.RecorderManager.onStart((res) => {
						console.log('recorder onstart')
						// that.recorder_status = 'recording'

						// #ifdef MP-WEIXIN
						wx.vibrateShort({
							type: 'light'
						})
						// #endif

						that.status = 'recording'
					})

					this.RecorderManager.onStop((res) => {
						// console.log('recorder onstop')
						// console.log(res.duration)
						if (res.duration >= recorder_duration - 1000) {
							that.recorder_status = '超时结束'
						} else {
							that.recorder_status = 'stop'
						}
						// console.log('close recorder')
						console.log('assign audio file', res.tempFilePath)
						that.current_audio_file = res.tempFilePath
						this.status = 'none'
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
				this.status = 'none'
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
			generateMessage(content, audio_str = null) {
				var that = this

				let data = {
					content,
					conv_id: that.conv.id,
					// audio: audio_str,
				}

				if (audio_str) {
					data.audio = audio_str
				}
				// let task = uni.request({
				// 	url: utils.domain + '/api/message',
				// 	method: 'POST',
				// 	data,
				// 	header: {
				// 		Authorization: 'Bearer ' + utils.getToken(),
				// 		Accept: 'application/json',
				// 		Platform: utils.platform
				// 	},
				// 	// enableChunked: true,
				// 	success(res) {
				// 		console.log('suceess', res)
				// 		that.messages.push(res.data.message)
				// 	}
				// })
				utils.request('post', '/api/message', data, (res) => {
					that.current_content = null
					that.text = null
					that.current_audio_file = null
					console.log(res)
					if (res.error == 0) {
						let user_message = that.messages[that.messages.length - 1]
						if (user_message && user_message.role == 'user') {
							that.messages[that.messages.length - 1].id = res.last_message_id
						}
						that.messages.push(res.message)
						that.scrollToBottom()
						if (that.mode == 'phone') {
							that.phone_status = 'speaking'
							that.status = 'none'
							// console.log('status phoning & speaking')
							that.switchPlay(that.messages[that.messages.length - 1], 'playing', () => {
								console.log('player ended')
								// context.offEnded()
								that.turnNotice(that.call)

							})
						} else {
							that.status = 'none'
							that.switchPlay(that.messages[that.messages.length - 1])

						}
					} else if (res.error == 116) {
						uni.showToast({
							title: '敏感信息，不便展示',
							icon: 'none',
						})
						that.status = 'none'
					} else if (res.error == 102) {
						// that.status = 'halt'
						uni.showToast({
							title: '试用结束，请购买会员',
							icon: 'none',
						})
					} else {
						uni.showToast({
							title: '网络错误，请稍后再试',
							icon: 'none',
						})
					}
				})
				// console.log(task)



				// task.onChunkReceived((response) => {
				// 	// console.log(response)

				// 	let arrayBuffer = new Uint8Array(response.data).buffer;
				// 	let text = utils.arrayBufferToText(arrayBuffer);
				// 	// console.log('receive')
				// 	// console.log(text); // 输出 "Hello"
				// 	let lines = text.split("\n")
				// 	lines.forEach((line) => {
				// 		if (line) {
				// 			let data = JSON.parse(line)
				// 			console.log('receive data', data)
				// 			if (data.error == 0) {
				// 				if (data.status == 'init') {
				// 					that.messages.push(data.message)
				// 				}
				// 				if (data.status == 'ready') {
				// 					// console.log('status ready')

				// 					if (that.mode == 'phone') {
				// 						that.phone_status = 'speaking'
				// 						that.status = 'none'
				// 						// console.log('status phoning & speaking')
				// 						that.play(that.messages[that.messages.length - 1], () => {
				// 							console.log('player ended')
				// 							// context.offEnded()
				// 							that.turnNotice()
				// 							that.call()
				// 						})
				// 					} else {
				// 						// if (res.end) {
				// 						// 	that.status = 'end'
				// 						// } else {
				// 						// }
				// 						that.play(that.messages[that.messages.length - 1])
				// 						that.status = 'none'
				// 					}

				// 					that.scrollToBottom()
				// 				}
				// 			} else {
				// 				if (data.error == 116) {
				// 					uni.showToast({
				// 						title: '敏感信息，不便展示',
				// 						icon: 'none',
				// 					})
				// 					that.status = 'none'
				// 				} else if (data.error == 102) {
				// 					// that.status = 'halt'
				// 					uni.showToast({
				// 						title: '试用结束，请购买会员',
				// 						icon: 'none',
				// 					})
				// 				} else {
				// 					uni.showToast({
				// 						title: '网络错误，请稍后再试',
				// 						icon: 'none',
				// 					})
				// 				}

				// 			}
				// 		}
				// 	})

				// })
			},
			sendText() {
				// console.log(this.text)
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

				this.generateMessage(this.text)
			},
			sendMessage() {
				var that = this

				// this.current_content = 'Hi, my name is Allen';

				if (!this.current_content) {
					// console.log('status', this.status)
					// console.log('status', this.phone_status)
					// 用户产生杂音，触发了sendMessage
					if (this.status == 'recording' && this.phone_status == 'listening') {
						this.handleRecordStart()
					} else {
						uni.showToast({
							title: '未识别内容，请重试',
							icon: 'none'
						})
						this.status = 'none'

					}
					return;
				}


				// if (this.mode == 'phone') {
				// 	this.turnNotice()
				// }

				this.messages.push({
					role: 'user',
					content: this.current_content,
					audio_file: this.current_audio_file
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
						that.generateMessage(that.current_content, audio_str)
					},
					fail(error) {
						console.log('读取文件失败', error);
					}
				});



			},
			handleInput: utils.debounce(function(e) {
				// console.log(e)
				this.text = e.detail.value
			}),
			goBack() {
				uni.navigateBack()
			}
		}
	}
</script>

<style lang="scss">
	page {
		background-color: #fff;
	}

	.content {
		padding: 32rpx 32rpx 0;
	}

	.session {
		display: flex;
		font-size: 14px;
		margin-top: 24rpx;
		gap: 24rpx;

		.avatar {
			flex: none;
			// border-radius: 50%;
			width: 64rpx;
			height: 64rpx;
		}

		.message-box {
			background-color: #FAFAFA;
			padding: 32rpx;
		}

		.assistant-box,
		.twinkling {
			border-radius: 0rpx 24rpx 24rpx 24rpx;
		}

		.user-box {
			border-radius: 24rpx 0rpx 24rpx 24rpx;
		}

		.placeholder {
			width: 64rpx;
			flex: none;
		}

		.message-dashboard {
			display: flex;
			justify-content: space-between;
			margin-top: 32rpx;
		}
	}

	.user-session {
		flex-direction: row-reverse;

		.message-box {
			background-color: #E1FFEF;
		}
	}



	.dashboard {
		position: fixed;
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

	.input-bottom {
		// height: 112rpx;
		padding: 28rpx 32rpx;
		box-sizing: border-box;
		box-shadow: 0rpx -2rpx 0rpx 0rpx #F1F3F5;
	}

	.extra-btn {
		display: flex;
		align-items: center;
		padding: 20rpx;
		border-radius: 16rpx;
		background: #FAFAFA;
		gap: 8rpx;
	}

	.addition {
		margin-top: 16rpx;
		border-top: 2rpx solid #F1F3F5;
		padding-top: 16rpx;
		font-size: 26rpx;
		color: #8C8E9D;
	}

	.keyboard-text {
		padding: 8rpx 0 8rpx 0;
		overflow: hidden;
		word-wrap: break-word;
		width: 100%;
		line-height: 33rpx;
	}

	.recording {
		background-color: #1CD1AD;
		font-size: 32rpx;
		color: #FFFFFF;
		height: 112rpx;
	}

	.filter {
		filter: blur(10rpx)
	}

	.filter view {
		pointer-events: none;
	}

	.lh-56 {
		line-height: 56rpx;
	}

	.upgrade {
		width: 100%;
		height: 104rpx;
		color: white;
		font-size: 32rpx;
		background: #FA9422;
		box-shadow: inset 0rpx 8rpx 16rpx 10rpx rgba(255, 255, 255, 0.1);
		border-radius: 104rpx 104rpx 104rpx 104rpx;
		flex-grow: 0;
		margin-top: 48rpx;
		margin-bottom: 24rpx;
	}
</style>