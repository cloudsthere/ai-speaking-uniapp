<template>
	<view class="px-8 mt-4 h-full">
		<view @click="selectFromWx"
			class="flex gap-2 justify-start items-center fs-30 font-medium  rounded-xl  my-2 py-2 px-2 bg-primary ">
			<uni-icons type="weixin" size="26"></uni-icons>
			<view class="flex flex-col gap-1">
				<text class="fs-30">微信消息</text>
				<text class="fs-24">从您的微信聊天消息中选择</text>
			</view>
		</view>
		<view @click="selectFromLocal"
			class="flex gap-2 justify-start items-center fs-30 font-medium  rounded-xl  my-2 py-2 px-2 bg-primary ">
			<uni-icons type="image" size="26"></uni-icons>
			<view class="flex flex-col gap-1">
				<text class="fs-30">文件系统</text>
				<text class="fs-24">从您的本地文件系统中选择</text>
			</view>
		</view>
		<view @click="openRecord"
			class="flex gap-2 justify-start items-center fs-30 font-medium  rounded-xl  my-2 py-2 px-2 bg-primary relative">
			<uni-icons type="mic" size="26"></uni-icons>
			<view class="flex flex-col gap-1">
				<text class="fs-30">录制声音</text>
				<text class="fs-24">使用麦克风录制您自己的声音</text>
			</view>
		</view>
		<view class="text-xs flex justify-center gap-1">
			<uni-icons type="info"></uni-icons>
			<text>请上传一个清晰的10-15秒音频/视频片段（超过15秒的内容将被截断），避免背景噪音</text>
		</view>
		<view class="flex flex-col gap-1 mt-6" v-if="tmp_url">
			<view class="text-sm">上传音频片段</view>
			<voice-player :duration="duration" :url="tmp_url" class=""></voice-player>
		</view>
		<view class="flex flex-col gap-1 mt-4" v-if="engine_voice_id">
			<view class="text-sm">生成音效</view>
			<view class="p-2 rounded-xl text-lg border-text" style="">{{preview_text}}</view>
			<voice-player :duration="duration" :url="preview_audio" class=""></voice-player>
		</view>
		<tui-button :disabled="!engine_voice_id" @click="submit"
			class="flex gap-1 absolute bottom-0 left-0 right-0 px-4 pb-4" size="26" height="70rpx">
			<text>下一步</text>
		</tui-button>
	</view>
	<uni-popup v-model="open_record" ref="record" type="bottom" background-color="#fff">
		<view class="relative py-2 px-4" style="min-height: 60vh;">
			<view class="flex flex-col gap-1 items-center fs-26">
				<view class="">录制 3-15 秒长的音频</view>
				<view class="">避免背景噪音</view>
			</view>
			<view class="mt-3 p-2 rounded-xl text-xl border-text" style="">
				你笑起来的样子真美，像春天的阳光一样温暖，今天穿的衣服也很适合你，显得你更好看了。</view>
			<view class="flex gap-1 justify-center mt-2">
				<uni-icons type="mic" v-if="['none', 'recording'].includes(record_status)"></uni-icons>
				<uni-icons type="micoff" v-if="record_status == 'recorded'"></uni-icons>
				<view class="">{{showRecordTimeCount()}}</view>
			</view>
			<view class="text-red-500 text-center fs-22 mt-2" v-if="record_warning">
				语音片段长度必须为 3 到 15 秒
			</view>
			<view class="absolute bottom-0 left-0 right-0 px-4 pb-4 gap-1 flex flex-col">
				<tui-button @click="stopRecord" :plain="true" v-if="record_status == 'recording'" class="flex gap-1"
					size="26" height="70rpx">
					<text>停止</text>
				</tui-button>
				<tui-button @click="startRecord" v-if="['none', 'recorded'].includes(record_status)" class="flex gap-1"
					size="26" height="70rpx">
					<uni-icons type="mic" color="white"></uni-icons>
					<text>录制</text>
				</tui-button>
				<tui-button @click="endRecord" v-if="record_status == 'recorded'" class="flex gap-1" size="26"
					height="70rpx">
					<text>确定</text>
				</tui-button>
			</view>

		</view>
	</uni-popup>
</template>

<script>
	import tuiButton from "@/components/thorui/tui-button/tui-button.vue"
	import voicePlayer from "../component/voicePlayer.vue"
	import utils from '@/common/utils.js';

	var recorderManager;
	const extension = [
		// 音频
		'mp3', 'wav', 'aac', 'flac', 'ogg', 'wma', 'm4a', 'aiff', 'aif', 'mp2', 'caf',
		// 视频
		'mp4', 'avi', 'mov', 'mkv', 'flv', 'wmv', 'webm', 'mpeg', 'mpg', '3gp', 'ts'
	]

	export default {
		components: {
			tuiButton,
			voicePlayer
		},
		data() {
			return {
				tmp_url: '',
				duration: 0,
				open_record: false,
				record_status: 'none',
				record_time_count: 0,
				record_timer: null,
				record_warning: false,
				engine_voice_id: null,
				sample: null,
				preview_text: null,
				preview_audio: null
			}
		},
		onLoad() {
			// this.$refs.record.open()
		},
		methods: {
			openRecord() {
				this.$refs.record.open()
			},
			upload() {
				uni.showLoading({
					title: '正在处理音频'
				})

				var that = this
				uni.uploadFile({
					url: utils.domain + '/api/voice/record', //仅为示例，非真实的接口地址
					filePath: this.tmp_url,
					name: 'file',
					header: {
						Authorization: 'Bearer ' + utils.getToken(),
					},
					formData: {
						// 'user': 'test'
					},
					success: (res) => {
						uni.hideLoading()
						// console.log(res.data);
						let data = JSON.parse(res.data)
						that.engine_voice_id = data.engine_voice_id
						that.sample = data.sample
						that.preview_text = data.preview_text
						that.preview_audio = data.preview_audio

					},
					fail(res) {
						console.log('upload fail', res)
					}
				});

			},
			submit() {
				uni.navigateTo({
					url: `/pages/voice/create?engine_voice_id=${this.engine_voice_id}`
				})
			},
			choose(res) {
				console.log(res)
				// const tempFilePaths = res.tempFiles
				// console.log(this.tmp_url.split('.').pop())
				let path = res.tempFiles[0].tempFilePath || res.tempFiles[0].path
				if (!extension.includes(path.split('.').pop())) {
					uni.showModal({
						title: '请选择视频/音频文件',
						icon: 'error'
					})
					return
				}
				this.tmp_url = path
				// this.duration = Math.ceil(res.tempFiles[0].time / 1000)
				// this.upload(res.tempFiles[0].path)
				// console.log(this.tmp_url)
				this.upload()
			},
			selectFromWx() {
				var that = this
				wx.chooseMessageFile({
					count: 1,
					type: 'all',
					extension,
					success(res) {
						that.choose(res)
					}
				})
			},
			selectFromLocal() {
				var that = this
				uni.chooseMedia({
					count: 1,
					type: 'video',
					extension,
					maxDuration: 60,
					success(res) {
						that.choose(res)
					}
				})
			},
			showRecordTimeCount() {
				return '00:' + this.record_time_count.toString().padStart(2, '0')
			},
			startRecord() {
				var that = this
				if (!recorderManager) {
					recorderManager = uni.getRecorderManager();
					recorderManager.onStop(function(res) {
						// console.log('recorder stop' + JSON.stringify(res));
						if (that.record_time_count <= 3) {
							that.record_warning = true
						} else {
							that.tmp_url = res.tempFilePath;

						}
					});
				}
				recorderManager.start()
				this.record_status = 'recording'
				this.record_warning = false
				this.record_time_count = 0
				if (this.record_timer) {
					clearInterval(this.record_timer)
				}
				this.record_timer = setInterval(() => {
					that.record_time_count++
					if (that.record_time_count > 15) {
						that.stopRecord()
					}
				}, 1000)
			},
			stopRecord() {

				this.record_status = 'recorded'
				clearInterval(this.record_timer)
				recorderManager.stop()
			},
			endRecord() {
				this.$refs.record.close()
				if (this.tmp_url) {
					this.upload()
				}
			},

		}
	}
</script>

<style>
	page {
		height: 100%;
	}

	.border-text {
		border: 1px solid #f3f4f6;
	}
</style>