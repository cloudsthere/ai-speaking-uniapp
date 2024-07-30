<template>
	<tui-navigation-bar backgroundColor="#fff" :is-opacity="false" title="聊天" color="#000">
		<view class="tui-header-icon">
			<navigator v-if="userInfo.avatar" url="/pages/home/price">
				<!-- <img class="nav-avatar rounded-half" :src="userInfo.avatar" /> -->
				<img class="nav-avatar rounded-half" src="/static/default_avatar.jpg" />
			</navigator>
			<navigator v-else url="/pages/auth/login">
				<img class="nav-avatar rounded-half" src="/static/default_avatar.jpg" />
			</navigator>
		</view>

		<!-- <view class="bg">
		<img class="img" mode="scaleToFill" src="/static/chat-bg.jpg" alt="" />
	</view> -->
	</tui-navigation-bar>
	<view class="main content" :style="{marginTop: height + 'px'}">
		<tui-list-view unlined="all" backgroundColor="#fff">
			<tui-swipe-action v-for="conv in convs" :key="conv.id" :actions="[
					{
						color: '#fff',
						fontsize: 32,
						width: 56,
						imgWidth: 48,
						imgHeight: 48,
						icon: conv.sort > 0 ? '/static/icon-pin-cancel.svg' : '/static/icon-pin.svg',
						background: '#FF8741',
					},{
						color: '#fff',
						fontsize: 32,
						width: 56,
						imgWidth: 48,
						imgHeight: 48,
						icon: '/static/icon-delete.svg',
						background: '#FF5661'
				 }]" :forbid="!!conv.is_primary" @click="(param) => handleSwiperBtn(conv, param)">
				<template v-slot:content>
					<navigator :url="'/pages/conversation/show?conv_id=' + conv.id">
						<tui-list-cell unlined :arrow="false" padding="24rpx 32rpx"
							:backgroundColor="(conv.is_primary || conv.sort > 0) ? '#FAFAFA' : '#fff'">
							<view class="flex justify-between items-stretch w-full gap-3">
								<view class="flex overflow-hidden">
									<img class="avatar br-24 flex-fixed" :src="conv.agent.avatar" />
									<view class="cell-title overflow-hidden">
										<view class="font-semibold fs-32">{{conv.agent.name}}</view>
										<view class="cell-brief mt-8 c-gray-1 text-ellipsis  overflow-hidden">
											{{conv.last_message ?? conv.agent.subtitle}}
										</view>
									</view>
								</view>
								<view class="flex justify-center items-center" @click.stop.prevent="call(conv.id)" >
									<image class="btn-icon flex-fixed" src="/static/icon-phone.svg"/>

								</view>
							</view>
						</tui-list-cell>
					</navigator>
				</template>
			</tui-swipe-action>
		</tui-list-view>

	</view>
</template>

<script>
	import tuiNavigationBar from "@/components/thorui/tui-navigation-bar/tui-navigation-bar.vue"
	import tuiSwipeAction from "@/components/thorui/tui-swipe-action/tui-swipe-action.vue"
	import tuiListView from "@/components/thorui/tui-list-view/tui-list-view.vue"
	import tuiListCell from "@/components/thorui/tui-list-cell/tui-list-cell.vue"
	import utils from '@/common/utils.js'

	export default {
		components: {
			tuiListView,
			tuiNavigationBar,
			tuiListCell,
			tuiSwipeAction
		},
		data() {
			return {
				height: getApp().globalData.height,

				userInfo: {},
				convs: [],
			}
		},
		onShow() {
			this.userInfo = utils.getUser()
			this.getData()
		},
		onShareAppMessage(res) {
			return utils.share()
		},
		onShareTimeline(res) {
			return utils.share()
		},
		methods: {
			getData() {
				utils.request('GET', '/api/conversation', {}, (res) => {
					this.convs = res.conversations
					// console.log(res.conversations)
				})
			},
			deleteConv(conv_id) {
				utils.request('POST', '/api/conversation/' + conv_id + '/delete', {}, (res) => {
					this.getData()
				})
			},
			handleSwiperBtn(conv, p) {
				switch (p.index) {
					case 0:
						return conv.sort > 0 ? this.cancelTop(conv.id) : this.top(conv.id)
					case 1:
						return this.deleteConv(conv.id)
				}
			},
			cancelTop(conv_id) {
				utils.request('POST', '/api/conversation/' + conv_id + '/down', {}, (res) => {
					this.getData()
				})
			},
			top(conv_id) {
				utils.request('POST', '/api/conversation/' + conv_id + '/top', {}, (res) => {
					this.getData()
				})
			},
			call(conv_id) {
				uni.navigateTo({
					url: `/pages/conversation/show?conv_id=${conv_id}&mode=phone`
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

	page {
		background-color: #F7FFFE;
	}

	.nav-avatar {
		margin-left: 32rpx;
		width: 56rpx;
		height: 56rpx;
	}

	.avatar {
		width: 96rpx;
		height: 96rpx;
		margin-right: 24rpx
	}

	.btn-icon {
		width: 48rpx;
		height: 48rpx;
	}

	.tui-list-item {
		padding: 40rpx 30rpx;
		display: flex;
		align-items: center;
		box-sizing: border-box;
	}

	.header {
		padding-top: var(--status-bar-height);
		height: 32px;
		display: flex;
		align-items: center;
	}

	.header .nav {
		width: 100%;
		text-align: center;
	}

	.main {
		margin-top: 69px;
	}

	.bg {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 0;
		z-index: -1
	}

	.bg .img {
		width: 100%;
		height: 348rpx;
	}
</style>