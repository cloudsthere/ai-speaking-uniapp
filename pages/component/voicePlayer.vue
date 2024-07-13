<template>
	<view class="flex justify-between rounded-3xl py-2 px-4" style="background: #e1e9f4;" @click="switchPlay">
		<uni-icons type="sound-filled"></uni-icons>
		<view :class="{playing: playing}" class="flex justify-center items-center music relative gap-1">
			<div class='bar'></div>
			<div class='bar'></div>
			<div class='bar'></div>
			<div class='bar'></div>
			<div class='bar'></div>
			<div class='bar'></div>
			<div class='bar'></div>
			<div class='bar'></div>
			<div class='bar'></div>
			<div class='bar'></div>
		</view>
		<!-- <text>{{show_duration}}</text> -->
		<text> </text>
	</view>

</template>

<script>
	const innerAudioContext = uni.createInnerAudioContext();
	var timer;
	export default {
		props: ['url'],
		data() {
			return {
				playing: false,
				show_duration: '00:00',
				pass: 0,
			}
		},
		// watch: {
		// 	url() {
		// 		console.log('watch url')
		// 		if (this.url) {
		// 			this.calcDuration()
		// 		}
		// 	}
		// },
		methods: {
			switchPlay() {
				this.playing = !this.playing
				console.log(this.url, this.playing)
				var that = this
				if (this.playing && this.url) {
					// console.log('context')
					this.tik()
					innerAudioContext.src = this.url
					// innerAudioContext.autoplay = true
					innerAudioContext.onPlay(() => {
						console.log('开始播放');
					});
					innerAudioContext.onError((res) => {
						that.playing = false
						innerAudioContext.stop()
						that.clear()
						// console.log(res.errMsg);
						// console.log(res.errCode);
					});
					innerAudioContext.onEnded((res) => {
						that.playing = false
						that.clear()
					})
					innerAudioContext.play()
				} else {
					innerAudioContext.stop()
					this.clear()
				}

			},
			tik() {
				// var that = this
				// timer = setInterval(() => {
					// console.log('pass', that.pass)
					// that.pass++
					// that.calcDuration()
				// }, 1000)
			},
			calcDuration() {
					console.log('duration', innerAudioContext.duration)
					console.log('currentTime', innerAudioContext.currentTime)
					if (!innerAudioContext.duration) {
						this.show_duration = '00:00'
						return
					}
					let left = parseInt(innerAudioContext.duration - innerAudioContext.currentTime)
					const minutes = Math.floor(left / 60);
					const secs = left % 60;
					this.show_duration =
						`${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`

			},
			clear() {
				// this.calcDuration()
				// this.pass = 0
				clearInterval(timer)
			}
		}
	}
</script>

<style>
	.music .bar {
		width: 12rpx;
		height: 40rpx;
		border-radius: 10rpx;
		background-color: #1e2127;
	}

	.playing .bar {
		animation: up_down 1s ease-in-out infinite;
	}

	@keyframes up_down {

		0%,
		100% {
			height: 40rpx;
		}

		50% {
			height: 2rpx;
		}
	}

	.music .bar:nth-child(1) {
		animation-delay: 1s;
	}

	.music .bar:nth-child(2) {
		animation-delay: 0.8s;
	}

	.music .bar:nth-child(3) {
		animation-delay: 0.6s;
	}

	.music .bar:nth-child(4) {
		animation-delay: 0.4s;
	}

	.music .bar:nth-child(5) {
		animation-delay: 0.2s;
	}

	.music .bar:nth-child(6) {
		animation-delay: 0.2s;
	}

	.music .bar:nth-child(7) {
		animation-delay: 0.4s;
	}

	.music .bar:nth-child(8) {
		animation-delay: 0.6s;
	}

	.music .bar:nth-child(9) {
		animation-delay: 0.8s;
	}

	.music .bar:nth-child(10) {
		animation-delay: 1s;
	}
</style>