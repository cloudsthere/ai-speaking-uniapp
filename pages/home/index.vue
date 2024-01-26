<template>
	<page-meta page-style="background-image: url(/static/chat-bg.jpg);background-repeat: no-repeat">
		<tui-navigation-bar transparent splitLine title="发现" color="#000"></tui-navigation-bar>
	</page-meta>
	<scroll-view scroll-y :style="{position: 'absolute', top: height + 'px', height: `calc(100% - ${height}px)`}" >
		<view class="main p-h-32">
			<view class="flex">
				<view class="mt-8 relative">
					<view class="mt-32 c-blue-1 font-semibold lh-30 fs-26 greeting">{{teacher.greeting}}</view>
					<view class="flex gap-3">
						<navigator url="/pages/home/teacher"
							class="mt-32 fs-24 br-16 c-gray-2 bg-gray changeRole">更换角色
						</navigator>
						<view class="mt-32 p-12 br-16 voice-box"
							@click="greeting">
							<img class="voice" src="/static/icon-voice-white.svg" />
						</view>
					</view>
					
					<image class="absolute top-0 left-0 z-behind bg-text" src="/static/bg-marks.svg" />
				</view>
				<view class="relative pt-32 ml-24 rounded-half overflow-hidden" >
					<image class="teacher-avatar" :src="teacher.avatar_pic" mode=""></image>
				</view>
			</view>
			<view class="c-blue-1 section-title font-semibold">
				<text>场景</text>
			</view>
			<view class="content">
				<navigator :url="'/pages/conversation/show?scene_id=' + scene.id" v-for="(scene, scene_index) in scenes"
					:key="scene_index">
					<view class="p-24 scene-card">
						<view class="name flex justify-between">
							<view class="c-blue-1 fs-30">{{scene.name}}</view>
							<image class="voice-sleep" src="/static/icon-voice-grey.svg" />
						</view>
						<view class="brief c-gray-1 fs-24">
							<view>{{scene.brief}}</view>
						</view>
						<view class="flex justify-end">
							<image class="scene-img" :src="scene.avatar" mode=""></image>
						</view>
					</view>
				</navigator>
			</view>
		</view>
	</scroll-view>
</template>

<script>
	import utils from '@/common/utils.js';
	import player from '@/common/player.js';
	import tuiNavigationBar from "@/components/thorui/tui-navigation-bar/tui-navigation-bar.vue"

	export default {
		components: {
			tuiNavigationBar
		},
		data() {
			return {
				height: 0,
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
		onReady() {
			uni.getSystemInfo({
				success: (e) => {
					let custom = uni.getMenuButtonBoundingClientRect();
					this.height = custom.height + custom.top  * 2 - e.statusBarHeight + 4;
				}
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
				player.sound(this.teacher.audio)
				// this.is_greeting = true
				// console.log(this.is_greeting)
				// let context = uni.createVideoContext('greeting-video')
				// context.play()
			},
			// greetingEnd() {
			// 	console.log('greeting end')
			// 	this.is_greeting = false
			// 	let context = uni.createVideoContext('still-video')
			// 	context.play()
			// }
		}
	}
</script>

<style lang="scss">
	.bg {
		position: absolute;
		top: 0;
		height: 348rpx;
		width: 100%;
		z-index: -1;
	}
	
	.bg-text {
		width: 96rpx;
		height: 78rpx;
	}
	
	.greeting {
		font-family: PingFang SC, PingFang SC;
		width: 398rpx;
	}
	
	.voice-box {
		display: flex;
		background: linear-gradient(40deg, #1CD1AD 0%, #39E9C6 100%);
	}
	.voice {
		width: 28rpx;
		height: 28rpx;
	}
	
	.changeRole {
		padding: 8rpx 24rpx;
	}
	
	.teacher-avatar {
		width: 208rpx;
		height: 208rpx;
	}
	
	.section-title {
		margin-top: 48rpx;
		margin-bottom: 46rpx;
		margin-left: 24rpx;
	}
	
	.voice-sleep {
		width: 32rpx;
		height: 32rpx;
	}
	
	.scene-img {
		width: 80rpx;
		height: 80rpx;
	}
	
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
			margin-top: 16rpx;
			margin-bottom: 26rpx;
		}
	}
</style>