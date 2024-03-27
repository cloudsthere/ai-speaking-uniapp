<template>
	<view class="bg-white flex flex-col items-center setting" v-if="conv">
		<image class="rounded-half avatar" :src="conv.avatar"></image>
		<view class="c-blue-1 name">
			{{conv.name}}
		</view>
		<view class="fs-24 c-gray-1">{{conv.brief}}</view>
		<view class="mt-64 w-full">
			<navigator :url="'/pages/conversation/teacher?conv_id=' + conv.id" class="cell flex items-center justify-between w-full box-border">
				<view class="flex items-center gap-16">
					<image class="w-32" src="/static/icon-sound.svg" />
					<text class="c-blue-1 font-semibold fs-28">声音</text>
				</view>
				<view class="flex items-center gap-16">
					<text class="c-blue-1 fs-28">{{conv.teacher.name}}</text>
					<image class="w-32" src="/static/icon-rightarrow.svg" />
				</view>
			</navigator>
			<navigator @tap="clear" class="cell flex items-center justify-between w-full box-border">
				<view class="flex items-center gap-16">
					<image class="w-32" src="/static/icon-clean.svg" />
					<text class="c-blue-1 font-semibold fs-28">清除上下文</text>
				</view>
				<view class="flex items-center gap-16">
					<image class="w-32" src="/static/icon-rightarrow.svg" />
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
				conv: null,
				conv_id: null,
			}
		},
		onLoad(options) {
			this.conv_id = options.conv_id
		},
		onShow(options) {
			// console.log(options)
			var that = this
			utils.request('get', '/api/conversation/' + this.conv_id + '/setting', {}, (res) => {
				// console.log(res)
				that.conv = res.conversation
			})
		},
		methods: {
			clear() {
				utils.request('post', '/api/message/delete', {conv_id: this.conv.id}, (res) => {
					// console.log(res)
					if (res.error == 0) {
						uni.showToast({
							title: '删除成功',
						})
					}
				})
			}
		}
	}
</script>

<style scoped>
.avatar {
	width: 208rpx;
	height: 208rpx;
	margin-top: 64rpx;
	margin-bottom: 32rpx;
}

.name {
	font-size: 48rpx;
	margin-bottom: 16rpx;
	font-weight: 600;
}

.mt-64 {
	margin-top: 64rpx;
}

.cell {
	/* height: 100rpx; */
	padding: 34rpx 40rpx;
}
</style>