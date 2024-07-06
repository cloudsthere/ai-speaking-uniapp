<template>
	<!--
	<page-meta>
		<tui-navigation-bar transparent title="发现" color="#000"></tui-navigation-bar>
	</page-meta>
	-->
	<view class="px-4 mb-2 mt-2">
		<uni-easyinput v-model="q" @confirm="search" @clear="clear" prefixIcon="search" placeholder="搜索" confirmType="搜索" primaryColor="#7098e8" :trim="true" ></uni-easyinput>

	</view>
	<navigator url="/pages/home/create" class="flex gap-1 justify-center items-center fs-30 font-medium  rounded-xl mx-4 my-2 py-2 bg-primary ">
		<uni-icons type="plus"></uni-icons>
		<text>创建角色</text>
	</navigator>
	<scroll-view scroll-y>
		<view class="main px-4">
			<!--
			<view class="flex">
				<view class="mt-8 relative">
					<view class="mt-32 c-blue-1 font-semibold lh-30 fs-26 greeting ml-24">{{teacher.greeting}}</view>
					<view class="flex gap-3">
						<navigator :url="'/pages/home/teacher?id=' + teacher.id"
							class="mt-32 ml-24 fs-24 br-16 c-gray-2 bg-gray changeRole">更换角色
						</navigator>
						<view class="mt-32 p-12 br-16 voice-box" @click="greeting">
							<img v-if="is_greeting" class="voice" src="/static/icon-voice-white.png" />
							<img v-else class="voice" src="/static/icon-voice-white.svg" />
						</view>
					</view>
					
					<image class="absolute top-0 left-0 z-behind bg-text" src="/static/bg-marks.svg" />
				</view>
				<view class="relative pt-32 ml-24 rounded-half overflow-hidden flex-none" >
					<image class="teacher-avatar rounded-half" :src="teacher.avatar_pic" mode=""></image>
				</view>
			</view>
			-->
			<view class="content justify-center">
				<view v-if="loading" class="m-auto mt-4 animate-spin" >
					<uni-icons type="loop" class=""></uni-icons>
				</view>
				<template v-else>
					<view v-if="agents.length == 0" class="flex gap-1 justify-center items-center mt-4">
						<uni-icons type="info-filled"></uni-icons>
						<text>没有找到...</text>
					</view>
					<tui-list-view v-else unlined="all" backgroundColor="#fff" style="width: 100%;">
						<tui-swipe-action v-for="agent in agents" :key="agent.id" :actions="[
								{
									color: '#fff',
									fontsize: 32,
									width: 56,
									imgWidth: 48,
									imgHeight: 48,
									icon: agent.sort > 0 ? '/static/icon-pin-cancel.svg' : '/static/icon-pin.svg',
									background: '#FF8741',
								},{
									color: '#fff',
									fontsize: 32,
									width: 56,
									imgWidth: 48,
									imgHeight: 48,
									icon: '/static/icon-delete.svg',
									background: '#FF5661'
							 }]" @click="(param) => handleSwiperBtn(agent, param)">
							<template v-slot:content>
								<navigator :url="'/pages/conversation/show?agent_id=' + agent.id" class="bg-primary">
									<tui-list-cell unlined :arrow="false" padding="24rpx 32rpx"
										:backgroundColor="(agent.is_primary || agent.sort > 0) ? '#FAFAFA' : '#fff'">
										<view
											class="flex justify-between items-center w-full gap-3 py-2 px-2 box-border mb-2">
											<view class="flex overflow-hidden w-full items-center">
												<img class="avatar br-24 flex-fixed" :src="agent.avatar" />
												<view class="cell-title overflow-hidden flex gap-1 flex-col">
													<view class="font-semibold fs-32">{{agent.name}}</view>
													<view
														class="cell-brief c-gray-1 text-ellipsis fs-26 overflow-hidden whitespace-nowrap">
														{{agent.subtitle}}
													</view>
													<view class="flex gap-3 fs-20 c-gray-3">
														<view>@{{agent.creator.name}}</view>
														<view class="flex gap-1 items-center" v-if="agent.chat">
															<uni-icons type="chatboxes-filled" size="12"></uni-icons>
															<text>{{agent.chat}}</text>
														</view>
														<view class="flex gap-1 items-center" v-if="agent.like">
															<uni-icons type="hand-up-filled" size="12"></uni-icons>
															<text>{{agent.like}}</text>
														</view>
													</view>
												</view>
											</view>
											<!-- <image class="btn-icon flex-fixed" src="/static/icon-phone.svg" @click.stop.prevent="call(agent.id)"/> -->
										</view>
									</tui-list-cell>
								</navigator>
							</template>
						</tui-swipe-action>
					</tui-list-view>
				</template>
				
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
				is_greeting: false,
				q: '',
				loading: false
			}
		},
		onShow() {
			this.query()
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
			},
			search() {
				// console.log('search')
				if (!this.q) {
					return
				}
				this.query()
			},
			clear() {
				console.log('clear')
				this.q = ''
				this.query()
			},
			query() {
					var that = this
					this.loading = true
					utils.request('GET', `/api/agent`, {q: this.q}, (res) => {
						console.log(res)
						this.loading = false
						that.agents = res.agents
					})
			}
		}
	}
</script>

<style scoped>
	>>>.tui-navigation-bar {
		overflow: hidden;
	}

	>>>.tui-navigation-bar .tui-navigation_bar-title {
		font-size: 32rpx;
		font-family: PingFang SC, PingFang SC;
		font-weight: 600;
	}
</style>

<style lang="scss">
	page {
		height: 100%;

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
			/* 50%宽度减去间距 */
			border-radius: 24rpx;
			/* 间距 */
			box-shadow: 0rpx 0rpx 60rpx 0rpx rgba(241, 241, 241, 0.6), 0rpx 4rpx 8rpx 0rpx rgba(241, 241, 241, 0.3);
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

	.avatar {
		width: 96rpx;
		height: 96rpx;
		margin-right: 24rpx
	}

	.tui-list-item {
		padding: 40rpx 30rpx;
		display: flex;
		align-items: center;
		box-sizing: border-box;
	}


</style>