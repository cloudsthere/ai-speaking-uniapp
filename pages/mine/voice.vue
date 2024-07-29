<template>
	<view class="px-4 py-4">
		<navigator url="/pages/voice/record"
			class="flex gap-1 justify-center items-center fs-30 font-medium  rounded-xl py-2 bg-primary mb-2">
			<uni-icons type="plus"></uni-icons>
			<text>创建我的声音</text>
		</navigator>
		<view class="flex gap-3 flex-col">
			<view class="flex gap-2 justify-between items-stretch" v-for="voice, index in voices" :key="index"
				@click="select(voice)">
				<view class="flex gap-3 justify-between items-center">
					<view class="rounded-lg flex justify-center items-center player-box"
						:style="'background-color: ' + bg_colors[index % bg_colors.length] + ';'">
						<uni-icons v-if="voice.playing" fontFamily="iconfont" type="">{{'\ue619'}}</uni-icons>
						<uni-icons v-else fontFamily="iconfont" type="">{{'\ue66e'}}</uni-icons>
					</view>
					<view class="flex flex-col">
						<view class="font-semibold text-sm">{{voice.name}}</view>
						<view class="text-xs">{{voice.description}}</view>
					</view>

				</view>
				<view @click.stop="toEdit(voice)" class="px-2 flex justify-center items-center">
					<uni-icons type="gear" size="30"></uni-icons>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import utils from '@/common/utils.js';
	const innerAudioContext = uni.createInnerAudioContext();
	export default {
		data() {
			return {
				bg_colors: ['#fcdb00', '#818900', '#0c7a7b', '#ab149d', '#f34c39', '#faa001', '#7d64fe', '#808900'],
				voices: [],
				selected_voice: {}
			}
		},
		onLoad() {
			var that = this
			utils.authGuard()
			utils.request('get', '/api/voice/user', {}, (res) => {
				// console.log(res)
				that.voices = res.voices
			})
		},
		onShow() {
		},
		methods: {
			select(voice) {
				this.selected_voice = voice
				for (let v of this.voices) {
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
					// console.log('开始播放');
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
			toEdit(voice) {
				uni.navigateTo({
					url: `/pages/voice/create?voice_id=${voice.id}`
				})
			}
		}
	}
</script>

<style>
	.player-box {
		width: 100rpx;
		height: 100rpx;
	}
</style>