<template>
	<view class="text-center text-gray-600 mt-10" v-if="halt">
		<text>课时不足，请</text>
		<navigator url="/pages/home/price" class="text-primary inline">购买会员→</navigator>
	</view>
	<template v-else>
		<view v-show="conv.id">
			<view class="p-4 text-sm">
				<view class="flex text-xl gap-4">
					<view class="">{{conv.emoji}}</view>
					<view class="">{{conv.topic}}</view>
				</view>
				<view class="flex mt-4 gap-2">
					<view class="text-gray-600 ">
						<view class="text-xs rounded border p-1 border-gray-100" style="width: 50px;">AI角色</view>
					</view>
					<view class="flex flex-col gap-1">
						<view class="">{{conv.bot_role}}</view>
						<view class="text-gray-400 text-xs">{{conv.bot_role_en}}</view>
					</view>
				</view>
				<view class="flex mt-4 gap-2">
					<view class="text-gray-600 ">
						<view class="text-xs rounded border p-1 border-gray-100" style="width: 50px;">我的角色</view>
					</view>
					<view class="flex flex-col gap-1">
						<view class="">{{conv.user_role}}</view>
						<view class="text-gray-400 text-xs">{{conv.user_role_en}}</view>
					</view>
				</view>
				<view class="flex mt-4 gap-2">
					<view class="text-gray-600 ">
						<view class="text-xs rounded border p-1 border-gray-100 text-center" style="width: 50px;">会话内容</view>
					</view>
					<view class="flex flex-col gap-1">
						<view class="">{{conv.task}}</view>
						<view class="text-gray-400 text-xs">{{conv.task_en}}</view>
					</view>
				</view>
			</view>
			<view class="mt-4 p-4 flex flex-col">
				<navigator :url="'/pages/conversation/show?conv_id=' + conv.id" class="btn-primary btn">开始会话</navigator>
			</view>
		</view>
	</template>

</template>

<script>
	import utils from '@/common/utils.js';


	export default {
		data() {
			return {
				conv: {},
				halt: false,
			}
		},
		onLoad(options) {
			// console.log(options)
			uni.showLoading({
				title: '加载中'
			})
			var that = this
			utils.request('POST', '/api/conversation', {
				topic_en: options.topic_en,
				topic: options.topic,
				emoji: options.emoji
			}, (res) => {
				// console.log(res)
				that.conv = res.conversation
				that.halt = res.halt
				uni.hideLoading()
			})
		},
		onShareAppMessage(res) {
			return utils.share()
		},
		onShareTimeline(res) {
			return utils.share()
		},
		methods: {

		}
	}
</script>

<style>
</style>