<template>
	<view class="px-4 py-4">
		<view class="flex justify-between mb-4 text-sm">
			<view class="flex gap-2 justify-start">
				<view @click="switchTab('all')" :class="tab == 'all' ? 'bg-custom' : 'bg-white'"
					class="px-2 py-1 text-gray-800 rounded-lg border-2 font-semibold border-custom">特色声音
				</view>
				<view @click="switchTab('my')" :class="tab == 'my' ? 'bg-custom' : 'bg-white'"
					class="px-2 py-1 text-gray-800 rounded-lg border-2 font-semibold border-custom">我的声音
				</view>
			</view>
			<view @click="submit" class="bg-custom text-gray-800 px-2 py-1 rounded-lg font-semibold flex justify-center items-center">
				<text class="">选择</text>
			</view>
		</view>
		<view class="flex gap-3 flex-col">
			<view class="flex gap-2 justify-between items-center" v-for="voice, index in voice_list" :key="index"
				@click="select(voice)">
				<view class="flex gap-3 justify-between items-center">
					<view class="rounded-lg flex justify-center items-center player-box"
						:style="'background-color: ' + bg_colors[index % bg_colors.length] + ';'">
						<uni-icons v-if="voice.playing" fontFamily="iconfont" type="">{{'\ue619'}}</uni-icons>
						<uni-icons v-else fontFamily="iconfont" type="">{{'\ue66e'}}</uni-icons>
					</view>
					<view class="flex flex-col flex-1">
						<view class="font-semibold text-sm">{{voice.name}}</view>
						<view class="text-xs">{{voice.description}}</view>
						<view class="text-xs" v-if="voice.created_by == 'user'">由 {{voice.user.name}} 创建</view>
						<view class="text-xs" v-else>由 MateAI 创建</view>
					</view>

				</view>
				<view class="">
					<uni-icons v-if="voice.id == selected_voice.id" type="checkmarkempty" size="24"
						color="#23ee23"></uni-icons>
				</view>
			</view>
		</view>
	</view>
	<view class="absolute bottom-10 right-0 left-0 flex justify-center items-center ">
		<navigator url="/pages/voice/record" class="py-2 px-4 bg-custom font-medium rounded-3xl">创建我的声音</navigator>
	</view>
</template>

<script>
	import utils from '@/common/utils.js'

	const innerAudioContext = uni.createInnerAudioContext();
	export default {
		data() {
			return {
				bg_colors: ['#fcdb00', '#818900', '#0c7a7b', '#ab149d', '#f34c39', '#faa001', '#7d64fe', '#808900'],
				all_voices: [],
				my_voices: [],
				voice_list: [],
				tab: 'all',
				selected_voice: {}
			}
		},
		onLoad(options) {
			// console.log(options)
			var that = this
			if (options.voice_tab) {
				this.tab = options.voice_tab
			}
			utils.request('get', '/api/voice', {}, (res) => {
				// console.log(res)
				that.all_voices = res.all_voices
				that.my_voices = res.my_voices
				if (that.tab == 'all') {
					that.voice_list = res.all_voices
				} else {
					that.voice_list = res.my_voices
				}
				if (options.voice_id) {
					for (let voice of that.voice_list) {
						if (voice.id == options.voice_id) {
							that.selected_voice = voice
							break
						}
					}
				}
			})
		},
		methods: {
			switchTab(tab) {
				this.tab = tab
				this.voice_list = this[tab + '_voices']
			},
			select(voice) {
				this.selected_voice = voice
				for (let v of this.voice_list) {
					if (v.id != voice.id) {
						v.playing = false
					}
				}
				// console.log('playing', voice.playing)
				if (voice.playing) {
					voice.playing = false
					innerAudioContext.stop()
					return
				}
				voice.playing = true
				innerAudioContext.src = voice.preview_audio
				// innerAudioContext.autoplay = true
				innerAudioContext.onPlay(() => {
					console.log('开始播放');
				});
				innerAudioContext.onError((res) => {
					voice.playing = false
					innerAudioContext.stop()
					// console.log(res.errMsg);
					// console.log(res.errCode);
				});
				innerAudioContext.onEnded((res) => {
					voice.playing = false
				})
				innerAudioContext.play()
			},
			submit() {
				// console.log('submit')
				if (!this.selected_voice.id) {
					uni.showToast({
						title: '请先选择声音',
						icon: 'none'
					})
					return
				}
				innerAudioContext.stop()
				uni.navigateTo({
					url: '/pages/agent/create?voice_id=' + this.selected_voice.id + '&voice_name=' + this.selected_voice.name + '&voice_tab=' + this.tab
				})
			}
		}
	}
</script>

<style>
	page {
		height: 100%;
		position: relative;
	}

	.border-custom {
		border-color: #e1e9f4;
	}

	.bg-custom {
		background-color: #e1e9f4;
	}

	.player-box {
		width: 100rpx;
		height: 100rpx;
	}
</style>