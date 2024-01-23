<template>
	<tui-navigation-bar splitLine @init="initNavigation" transparent :isOpacity="false" @change="opacityChange" :scrollTop="scrollTop" title="聊天" color="#333">
	 <view class="tui-header-icon" :style="{ marginTop: top + 'px' }">
	   <tui-icon name="arrowleft" color="#333" @click="back"></tui-icon>
	 </view>
	</tui-navigation-bar>
	<view class="main">
		<view v-if="convs.length === 0" class="text-center ">
			<image mode="widthFix" class="mt-10" src="@/static/search-no-data.png" style="width: 50%;"></image>
			<view class="mt-2">您还没有会话...</view>
		</view>
		<view class="content" v-else>
			<navigator :url="'/pages/conversation/show?conv_id=' + conv.id"
				class="session flex shadow-md text-sm justify-between p-2 mb-4 mx-2" v-for="conv in convs" :key="conv.id">
				<view class="info">
					<view class="name text-lg">
						{{conv.name}}
					</view>
					<view class="time text-sm text-gray-400">
						{{conv.brief}}
					</view>
				</view>
				<view class="buttons mt-2">
					<button>继续</button>
				</view>
				<view class="buttons mt-2">
					<button @tap.stop="deleteConv(conv.id)">删除</button>
				</view>
				<view class="buttons mt-2">
					<button @tap.stop="top(conv.id)">置顶</button>
				</view>
			</navigator>
		</view>
	</view>
	
	<view class="bg">
		<img class="img" mode="scaleToFill" src="/static/chat-bg.jpg" alt="" />
	</view>
</template>

<script>
	import utils from '@/common/utils.js'
	import tuiNavigationBar from "@/components/thorui/tui-navigation-bar/tui-navigation-bar.vue"
	import tuiIcon from "@/components/thorui/tui-icon/tui-icon.vue"

	export default {
		components:{
			tuiNavigationBar,
			tuiIcon
		},
		data() {
			return {
				top: 24, //标题图标距离顶部距离
				scrollTop: 0.5,

				utils,
				convs: [],
			}
		},
		onShow() {
			var that = this
			utils.request('GET', '/api/conversation', {}, (res) => {
				// console.log(res)
				that.convs = res.conversations
			})
		},
		onShareAppMessage(res) {
			return utils.share()
		},
		onShareTimeline(res) {
			return utils.share()
		},
		methods: {
			deleteConv(conv_id) {
				// console.log(conv_id)
				utils.request('POST', '/api/conversation/' + conv_id + '/delete', {}, (res) => {
					console.log(res)
					// that.convs = res.conversations
				})
			},
			top(conv_id) {
				// console.log(conv_id)
				utils.request('POST', '/api/conversation/' + conv_id + '/top', {}, (res) => {
					console.log(res)
					// that.convs = res.conversations
				})
			}
		}
	}
</script>

<style>
.header {
	padding-top: var(--status-bar-height);
	height: 32px;
	display: flex;
	align-items: center;
}
.header .nav {
	width: 100%;
	/* display: flex;
	align-items: center; */
	text-align: center;
}
.main {
	margin-top: 64px;
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
	height: 174rpx;
}
.tui-header-icon {
	width: 100%;
	position: absolute;
	bottom: 12rpx;
	padding: 0 12rpx;
	display: flex;
	align-items: center;
	height: 32px;
	transform: translateZ(0);
	z-index: 99999;
	box-sizing: border-box;
}
</style>