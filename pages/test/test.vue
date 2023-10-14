<template>
	<view>
		<button @click="startRecord">开始</button>
		<button @click="endRecord">结束</button>
		<button @click="play">播放</button>
		<view class="">socket status: {{socket_status}}</view>
		<view class="">recorder status: {{recorder_status}}</view>
		<view class="">{{input}}</view>
	</view>
</template>

<script>
	// const CryptoJS = require('crypto-js')
	import CryptoJS from 'crypto-js';
	// import base64 from '@/common/base64.js';
	// import Base64 from 'js-base64';
	// const { toBase64 } = require('js-base64')
	// import xf_utils from '@/common/xf-utils.js';
	// var utils = require('../../utils/util.js')
	// var Base64 = require('js-base64').Base64
	var RecorderManager = wx.getRecorderManager()
	import base64 from '@/common/base64.js';

	const APPID = "abb0f990";
	const API_SECRET = "MzYzZjM2OGQ2NWU0ZTI4YjdmODNlYTNh";
	const API_KEY = "ca3a1899fffbe04843f348fcdf77e12b";

	var getparam = function(status) {

		var params = {
			common: {
				app_id: APPID,
			},
			business: {
				"aue": "raw",
				"vcn": "xiaoyan",
				"tte": "UTF8"
			},
			data: {
				status: status,
				text: ''

			}
		}
		var aa = JSON.stringify(params)
		return aa
	}
	
	var iatParams = function (status, audio) {
	  var params = {
	    common: {
	      app_id: APPID
	    },
	    business: {
	      domain: "iat" ,
	      // language: 'zh_cn',
		  language: 'en_us',
	      accent: "mandarin", 
	      dwa: "wpgs",
	      vad_eos: 10000
	    },
	    data: {
	      status: status,
	      format: "audio/L16;rate=16000",
	      encoding: "raw",
	      audio: audio
	    }
	  }
	  // console.log('params')
	  // console.log(params)
	  return JSON.stringify(params)
	}
	
	var geturl = function (appid, apisecret, apikey) {
	
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
	  var authorizationOrigin = `api_key="${apikey}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`
	  /* base64编码 */
	  var authorization = base64.btoa(authorizationOrigin)
	  var v = 'authorization=' + authorization + "&date=" + time + "&host=iat-api.xfyun.cn"
	  var url = `${url}?` + v
	  console.log(encodeURI(url))
	  return encodeURI(url)
	}
	
	var toBase64 = function(buffer) {
	  var binary = ''
	  var bytes = new Uint8Array(buffer)
	  var len = bytes.byteLength
	  for (var i=0; i<len; i++){
	    binary += String.fromCharCode(bytes[i])
	  }
	  return base64.btoa(binary)
	}

	const recorder_duration = 5000

	export default {
		data() {
			return {
				recorderManager: null,
				audio: null,
				first_status: true,
				input: '',
				socket_status: 'none',
				recorder_status: 'none',
			}
		},
		onLoad() {
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
				// wx.closeSocket()
			},
			startRecord() {
				var that = this
				this.recorderManager = RecorderManager
				var url = geturl(APPID, API_SECRET, API_KEY)
				console.log(url)
				// var status = 2
				wx.connectSocket({
					url: url,
					method: "GET",
				})

				wx.onSocketOpen(function() {
					console.log('合成链接已打开')
					that.socket_status = 'connected'
					wx.sendSocketMessage({
						data: iatParams(0)
					})
				})
				wx.onSocketError(function(errMsg) {
					that.socket_status = 'error'
					console.log('websocket合成链接打开失败')
					console.log(errMsg)
				})
				wx.onSocketMessage(function(res) {
					console.log('receive socket message')
					// console.log(res)
					// console.log(JSON.parse(res.data))
					renderResult(res.data)
				})
				wx.onSocketClose((res) =>{
					that.socket_status = 'close'
					console.log('socket close')
				})

				const options = {
					// 2分钟
					duration: recorder_duration,
					sampleRate: 16000,
					numberOfChannels: 1,
					format: 'PCM',
					frameSize: 1.28,
				}
				RecorderManager.start(options)
				console.log('ws链接打开成功，开始录音')
				
				RecorderManager.onStart((res) => {
					that.recorder_status = 'recording'
				})
				
				RecorderManager.onStop((res) => {
					// console.log(res.duration)
					if (res.duration >= recorder_duration - 1000) {
						that.recorder_status = '超时结束'
					} else {
						that.recorder_status = 'stop'
					}
					console.log('close recorder')
				})

				RecorderManager.onFrameRecorded(function(res) {
					console.log('frame recorded')
					// console.log(res.frameBuffer, res.isLastFrame)
					// console.log(this.data.first_status)
					// if (that.first_status) {
					// 	var status = 0
					// 	that.first_status = false
					// } else {
					// 	var status = 1
					// }
					let status = res.isLastFrame ? 2 : 1
					if (res.isLastFrame) {
						console.log('last frame')
					}
					
					// console.log(wx.arrayBufferToBase64(res.frameBuffer))
					// console.log(utils.iatParams(status, utils.toBase64(res.frameBuffer)))
					wx.sendSocketMessage({
						data: iatParams(status, uni.arrayBufferToBase64(res.frameBuffer))
					})
				})
				
				let resultTextTemp = ''
				let resultText = '';
				
				function renderResult(resultData) {
					// 识别结束
					let jsonData = JSON.parse(resultData);
					console.log(jsonData)
				
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
						that.input = text
					}
					if (jsonData.code === 0 && jsonData.data.status === 2) {
						console.log('socket code close')
						// iatWS.close();
						RecorderManager.stop();
					}
					if (jsonData.code !== 0) {
						// iatWS.close();
						console.log('socket code not 0')
						console.error(jsonData);
					}
				}

			}
		},
	}
	//
</script>

<style>
</style>