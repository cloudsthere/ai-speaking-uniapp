<template>
	<view class="p-4">
		<view class="flex justify-between gap-2">
			<!-- <view> -->
			<view class="flex flex-col gap-3">
				<view class="">{{teacher.greeting}}</view>
				<view class="flex gap-3">
					<navigator url="/pages/home/teacher"
						class="py-1 px-2 border border-primary border-solid text-primary rounded-full">更换AI
					</navigator>
					<view class="py-1 px-2 border border-primary border-solid bg-primary text-white rounded-full"
						@click="greeting">
						Say Hi
					</view>
				</view>
			</view>
			<view class="relative" style="width: 120px; height: 120px; flex: none;">
				<video id="still-video" v-show="!is_greeting" style="width: 120px; height: 120px;" object-fit="fill"
					:src="teacher.avatar_video_still" :autoplay="true" :show-progress="false"
					:show-fullscreen-btn="false" :show-play-btn="false" :show-center-play-btn="false"
					:show-loading="false" :loop="true" :controls="false"></video>
				<video id="greeting-video" v-show="is_greeting" style="width: 120px; height: 120px;"
					object-fit="fill" @ended="greetingEnd" :src="teacher.avatar_video_greeting" :autoplay="false"
					:show-progress="false" :show-fullscreen-btn="false" :show-play-btn="false"
					:show-center-play-btn="false" :show-loading="false" :loop="false" :controls="false"></video>
				<view class="absolute bottom-0 w-full" style="height: 40px; background-image: linear-gradient(to top, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0));"></view>
			</view>
		</view>
		<view class="mb-2 mt-10 flex gap-1 flex-col text-center">
			<text>选择合适场景，开始今天练习</text>
			<text class="text-xs text-primary">Choose a scene and practise now!</text>
		</view>
		<view class="content">
			<navigator :url="'/pages/conversation/detail?scene_id=' + scene.id" v-for="(scene, scene_index) in scenes"
				:key="scene_index">
				<view class="scene-card text-center">
					<view class="avatar text-3xl">
						<!-- {{scene.icon}} -->
						<image :src="scene.icon" mode=""></image>
					</view>
					<view class="name text-xl">
						<view>{{scene.name}}</view>
					</view>
					<view class="brief text-sm">
						<view>{{scene.en_name}}</view>
					</view>
				</view>
			</navigator>
		</view>
	</view>
</template>

<script>
	import utils from '@/common/utils.js';

	export default {
		data() {
			return {
				// scenes: [],
				scenes: [],
				teacher: {},
				is_greeting: false
			}
		},
		onLoad() {

		},
		onShow() {
			var that = this
			utils.request('GET', '/api/scene', {}, (res) => {
				that.scenes = res.scenes
				that.teacher = res.teacher
			})
		},
		onShareAppMessage(res) {
			return utils.share()
		},
		onShareTimeline(res) {
			return utils.share()
		},
		methods: {
			greeting() {
				// play.sound(this.teacher.greeting)
				this.is_greeting = true
				// console.log(this.is_greeting)
				let context = uni.createVideoContext('greeting-video')
				context.play()
			},
			greetingEnd() {
				console.log('greeting end')
				this.is_greeting = false
				let context = uni.createVideoContext('still-video')
				context.play()
			}
		}
	}
</script>

<style lang="scss">
	// .content {
	// 	display: grid;
	// 	padding: 0 10px 0 10px;
	// 	gap: 10px;
	// 	grid-template-columns: repeat(2, 1fr);
	// 	grid-template-rows: repeat(2, 1fr);
	// }
	.content {
		display: flex;
		align-items: stretch;
		flex-wrap: wrap;

		navigator {
			flex-basis: calc(50% - 10px);
			/* 50%宽度减去间距 */
			margin: 5px;
			/* 间距 */
		}
	}


	.header {
		text-align: center;
		margin: 10px 0 10px 0;
	}

	.selected-tag {
		border-bottom-width: 1px;
		border-color: $uni-color-primary;
	}

	.scene-card {
		padding: 20rpx;
		border-radius: $uni-border-radius-lg;
		box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);

		.avatar {
			text-align: center;

			image {
				border-radius: 50%;
				width: 120rpx;
				height: 120rpx;
			}
		}

		.name {
			margin-top: 10px;
			text-align: center;
			font-size: 16px;
		}

		.brief {
			margin-top: 10px;
			height: 32px;
			color: $uni-text-color-grey;
			font-size: $uni-font-size-sm;
		}
	}
</style>