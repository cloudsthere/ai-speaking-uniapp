<template>
	<view class="content">

		<view class="p-4 bg-white">
			<view
				class="flex gap-4 items-start border-b border-gray-100 items-stretch pb-4"
				v-if="user">
				<image :src="user.avatar" class="avatar" mode=""></image>
				<view class="flex flex-col justify-between">
					<view class="text-xl font-medium">
						{{user.name}}
					</view>
					<view class="flex items-center">
						<uni-icons custom-prefix="iconfont" type="icon-fanyi" size="20"></uni-icons>
						<text class="text-sm text-gray-400">普通会员</text>
					</view>
				</view>
			</view>
			<view class="flex justify-between px-4">
				<view class="flex flex-col justify-between items-center pt-4 gap-2">
					<view class="text-gray-400 text-sm">套餐剩余</view>
					<view class="text-xl">89小时</view>
				</view>
				<view class="flex flex-col justify-between items-center pt-4 gap-2">
					<view class="text-gray-400 text-sm">已使用</view>
					<view class="text-xl">35分钟</view>
				</view>
				<view class="flex flex-col justify-between items-center pt-4 gap-2">
					<view class="text-gray-400 text-sm">已赠送</view>
					<view class="text-xl">3分钟</view>
				</view>
			</view>
		</view>
		<view class="px-4 bg-white mt-4">
			<view class="flex items-center gap-3 border-b border-gray-100 py-4">
				<uni-icons custom-prefix="iconfont" type="icon-fanyi" size="20"></uni-icons>
				<view class="">
					钱包
				</view>
			</view>
			<view class="flex items-center gap-3 py-4">
				<uni-icons custom-prefix="iconfont" type="icon-fanyi" size="20"></uni-icons>
				<view class="">
					钱包
				</view>
			</view>
		</view>
		
		<view class="px-4 bg-white mt-4">
			<view class="flex items-center gap-3 border-b border-gray-100 py-4">
				<uni-icons custom-prefix="iconfont" type="icon-fanyi" size="20"></uni-icons>
				<view class="">
					钱包
				</view>
			</view>
			<view class="flex items-center gap-3 py-4">
				<uni-icons custom-prefix="iconfont" type="icon-fanyi" size="20"></uni-icons>
				<view class="">
					钱包
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import utils from '@/utils.js';

	export default {
		data() {
			return {
				user: utils.getUser(),
			}
		},
		onLoad() {

		},
		methods: {

		}
	}
</script>

<style lang="scss">
	.content {
		background: $uni-bg-color-grey;
		min-height: 100vh;
	}

	.avatar {
		width: 80px;
		height: 80px;
	}
</style>