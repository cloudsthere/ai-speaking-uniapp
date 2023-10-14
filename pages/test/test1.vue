<template>
	<view>
		<button @click="startRecord">开始</button>
		<button @click="endRecord">结束</button>
		<button @click="play">播放</button>
	</view>
</template>

<script>
	// const CryptoJS = require('crypto-js')
	import CryptoJS from 'crypto-js';
	import base64 from '@/common/base64.js';
	// const Base64 = require('js-base64').Base64
	// import Base64 from 'js-base64';
	// const Base64 = require('js-base64').Base64


	const APPID = "abb0f990";
	const API_SECRET = "MzYzZjM2OGQ2NWU0ZTI4YjdmODNlYTNh";
	const API_KEY = "ca3a1899fffbe04843f348fcdf77e12b";
	//

	var toBase64 = function(buffer) {
		var binary = ''
		var bytes = new Uint8Array(buffer)
		var len = bytes.byteLength
		for (var i = 0; i < len; i++) {
			binary += String.fromCharCode(bytes[i])
		}
		return base64.btoa(binary)
	}

	function getWebSocketUrl() {
		// 请求地址根据语种不同变化
		var url = "wss://iat-api.xfyun.cn/v2/iat";
		var host = "iat-api.xfyun.cn";
		var apiKey = API_KEY;
		var apiSecret = API_SECRET;
		var date = new Date().toGMTString();
		var algorithm = "hmac-sha256";
		var headers = "host date request-line";
		var signatureOrigin = `host: ${host}\ndate: ${date}\nGET /v2/iat HTTP/1.1`;
		var signatureSha = CryptoJS.HmacSHA256(signatureOrigin, apiSecret);
		var signature = CryptoJS.enc.Base64.stringify(signatureSha);
		var authorizationOrigin =
			`api_key="${apiKey}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`;
		// console.log('authorizationOrigin', authorizationOrigin)
		var authorization = base64.btoa(authorizationOrigin);
		// console.log('authorization', authorization)
		url = encodeURI(`${url}?authorization=${authorization}&date=${date}&host=${host}`);
		// console.log('url', url)
		return url;
	}



	export default {
		data() {
			return {
				recorderManager: null,
				audio: null
			}
		},
		onLoad() {
			// recorderManager
		},
		methods: {
			play() {
				let context = uni.createInnerAudioContext({
					obeyMuteSwitch: false,
				});
				context.src = this.audio
				context.play()
			},
			endRecord() {
				this.recorderManager.stop()
			},
			sendSocketMessage(audio) {
				var params = {
					common: {
						app_id: APPID,
					},
					business: {
						language: "zh_cn",
						domain: "iat",
						accent: "mandarin",
						dwa: "wpgs",
					},
					data: {
						status: 0,
						format: "audio/L16;rate=16000",
						encoding: "raw",
						// encoding: "lame",
					},
				};

				if (audio) {

					params.data.audio = audio
				}

				let send_data = JSON.stringify(params)
				// console.log('send socket message')

				this.iatWS.send({
					data: send_data,
					// success() {
					// 	console.log('first send message success')
					// }
				});
			},
			startRecord() {
				console.log('go')
				var that = this
				// console.log('socket url', getWebSocketUrl())
				var iatWS = uni.connectSocket({
					url: getWebSocketUrl(),
					fail(res) {
						console.log('socket连接错误', res)
					},
					success(res) {
						console.log('socket连接成功', res)
					}
				})

				var recorderManager = uni.getRecorderManager();
				this.recorderManager = recorderManager
				this.iatWS = iatWS

				iatWS.onOpen((e) => {
					console.log('socket open', e)
					// 开始录音
					// that.recorder.start({
					// 	sampleRate: 16000,
					// 	frameSize: 1280,
					// });
					const options = {
						// duration: 180000,
						sampleRate: 16000,
						numberOfChannels: 1,
						// encodeBitRate: 44100,
						frameSize: 1.28,
						format: 'PCM',
						// format: 'mp3',
					}
					recorderManager.start(options)

					this.sendSocketMessage()
					// changeBtnStatus("OPEN");
				})

				iatWS.onMessage((e) => {
					console.log('receive socket message')
					renderResult(e.data);
				})
				iatWS.onError((e) => {
					console.error('socket error', e);
					recorderManager.stop()
					// that.recorder.stop();
					// changeBtnStatus("CLOSED");
				})
				iatWS.onClose((e) => {
					console.log('socket close')
					recorderManager.stop()
					// that.recorder.stop();
					// that.is_recording = false
					// changeBtnStatus("CLOSED");
				})


				recorderManager.onStart(() => {
					console.log('recorder start')
				})
				recorderManager.onPause(() => {
					console.log('recorder pause')
				})
				recorderManager.onStop((res) => {
					console.log('recorder stop', res)
					that.audio = res.tempFilePath
					iatWS.close()
					// const {
					// 	tempFilePath
					// } = res
					// that.startUpRecord() //录音完成，准备调用讯飞接口
				})

				// console.log('begin 1')
				// console.log(iatWS.readyState)
				// console.log(iatWS.OPEN)
				// for (let i in iatWS) {
				// 	console.log(i)
				// }
				// console.log('end 1')
				recorderManager.onFrameRecorded(({
					isLastFrame,
					frameBuffer
				}) => {
					console.log('frame recorded')
					// console.log('readyState', iatWS.readyState)
					// console.log('OPEN', iatWS.OPEN)
					if (iatWS.readyState === iatWS.OPEN) {
						// that.sendSocketMessage(uni.arrayBufferToBase64(frameBuffer))
						that.sendSocketMessage(toBase64(frameBuffer))
						// let data = JSON.stringify({
						// 	data: {
						// 		status: isLastFrame ? 2 : 1,
						// 		format: "audio/L16;rate=16000",
						// 		encoding: "raw",
						// 		audio: uni.arrayBufferToBase64(frameBuffer),
						// 	},
						// })

						// // console.log('send data', data)

						// iatWS.send({data});
						if (isLastFrame) {
							// changeBtnStatus("CLOSING");
							console.log('last frame')
						}
					}
				})

				let resultTextTemp = ''
				let resultText = '';

				function renderResult(resultData) {
					// 识别结束
					let jsonData = JSON.parse(resultData);
					console.log('response data', jsonData)

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
						// that.input = text
					}
					if (jsonData.code === 0 && jsonData.data.status === 2) {
						console.log('socket code close')
						iatWS.close();
					}
					if (jsonData.code !== 0) {
						iatWS.close();
						console.log('socket code not 0')
						console.error(jsonData);
					}
				}
			}
		}
	}
</script>

<style>

</style>