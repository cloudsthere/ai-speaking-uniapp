<template>
	<page-meta>
		<tui-navigation-bar transparent title="发现" color="#000"></tui-navigation-bar>
	</page-meta>
	<scroll-view scroll-y :style="{position: 'absolute', top: height + 'px', height: `calc(100% - ${height}px)`}" >
		<view class="main p-h-32">
			<view class="flex">
				<view class="mt-8 relative">
					<view class="mt-32 c-blue-1 font-semibold lh-30 fs-26 greeting ml-24">{{teacher.greeting}}</view>
					<view class="flex gap-3">
						<navigator url="/pages/home/teacher"
							class="mt-32 ml-24 fs-24 br-16 c-gray-2 bg-gray changeRole">更换角色
						</navigator>
						<view class="mt-32 p-12 br-16 voice-box" @click="greeting">
							<img v-if="is_greeting" class="voice" src="/static/icon-voice-white.webp" />
							<img v-else class="voice" src="/static/icon-voice-white.svg" />
						</view>
					</view>
					
					<image class="absolute top-0 left-0 z-behind bg-text" src="/static/bg-marks.svg" />
				</view>
				<view class="relative pt-32 ml-24 rounded-half overflow-hidden flex-none" >
					<image class="teacher-avatar rounded-half" :src="teacher.avatar_pic" mode=""></image>
				</view>
			</view>
			<view class="c-blue-1 section-title font-semibold">
				场景
			</view>
			<view class="content">
				<navigator
					:url="'/pages/conversation/show?agent_id=' + agent.id"
					v-for="(agent, agent_index) in agents"
					:key="agent_index"
				>
					<view class="p-24 scene-card">
						<view class="name flex justify-between">
							<view class="c-blue-1 fs-30 font-semibold">{{agent.name}}</view>
							<image v-if="agent.isPlaying" class="voice" src="/static/icon-voice-selected.svg" />
							<image v-else class="voice-icon" src="/static/icon-voice-grey.svg" @tap.stop="playSceneVoice(agent)" />
						</view>
						<view class="brief c-gray-1 fs-24">
							<view>{{agent.brief}}</view>
						</view>
						<view class="flex justify-end">
							<image class="scene-img br-24" :src="agent.avatar" mode=""></image>
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
				agents: [],
				teacher: {},
				is_greeting: false
			}
		},
		onShow() {
			var that = this
			utils.request('GET', '/api/agent', {}, (res) => {
				that.agents = res.agents
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
				player.sound(this.teacher.audio, () => {
					this.is_greeting = false
				})
				this.is_greeting = true
				// console.log(this.is_greeting)
				// let context = uni.createVideoContext('greeting-video')
				// context.play()
			},
			playSceneVoice(scene) {
				utils.request('GET', '/api/agent/' + scene.id + '/greeting', {}, (res) => {
					scene.isPlaying = true
					player.sound(res.greeting_url, () => {
						scene.isPlaying = false
					})
				})
			}
		}
	}
</script>

<style scoped>
>>> .tui-navigation-bar {
		overflow: hidden;
	}
>>>	.tui-navigation-bar .tui-navigation_bar-title {
		font-size: 32rpx;
		font-family: PingFang SC, PingFang SC;
		font-weight: 600;
	}
</style>

<style lang="scss">
	page {
		height: 375rpx; 
		background-image: url(~@/static/chat-bg.jpg);
		background-size: 100% auto;
		background-repeat: no-repeat
	}
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
		line-height: 36rpx;
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
	
	.voice-icon {
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
			background-color: #fff;
			border-radius: 24rpx;
			/* 间距 */
			box-shadow: 0rpx 0rpx 60rpx 0rpx rgba(241,241,241,0.6), 0rpx 4rpx 8rpx 0rpx rgba(241,241,241,0.3);
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

		.avatar {
			text-align: center;

			image {
				border-radius: 50%;
				width: 120rpx;
				height: 120rpx;
			}
		}

		.name {
			text-align: center;
			font-size: 16px;
			align-items: flex-end;
		}

		.brief {
			margin-top: 16rpx;
			margin-bottom: 26rpx;
		}
	}
</style>