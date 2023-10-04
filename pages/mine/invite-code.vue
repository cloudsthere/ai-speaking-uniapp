<template>
	<view class="content pt-10 px-4">
		<view class="m-auto text-center">
			<image src="@/static/invite-code.jpeg" mode=""></image>
		</view>
		<view class="flex flex-col gap-4 mt-4">
			<view class="relative">
				<view v-if="has_code" class="w-fll text-center text-xl">{{code}}</view>
				<input v-else name="code" v-model="code" placeholder="邀请码" type="text"
					class="py-2 border-b text-center border-gray-200 m-auto" style="width: 50%;" />
			</view>
		</view>
		<view class="text-sm text-gray-600 mt-4 flex flex-col gap-2 text-center">
			填写后可获得10分钟课时，购买会员9折优惠
			<!-- <view class="text-gray-400">您可定制专属邀请码，也可以自动生成</view>
			<view class="text-gray-400">邀请码是4-10个字符，可包含字母、数字和下划线</view>
			<view class="text-gray-400">提交确认后不可修改</view> -->
		</view>
		<view class="flex flex-col gap-4 mt-4">
			<!-- <button class="btn btn-default" @click="" >随机生成</button> -->
			<button class="btn btn-primary" v-if="!has_code" @click="submit" >提交</button>
		</view>
		<view class="text-sm text-gray-600 mt-4 flex justify-center items-center">
			<navigator url="/pages/mine/promote" class="text-primary">生成我的邀请码，赚取推广奖励→</navigator>
		</view>
	</view>
</template>

<script>
	import utils from '@/common/utils.js';
	
	export default {
		data() {
			return {
				code: null,
				has_code: false,
			}
		},
		onLoad() {
			var that = this
			utils.request('GET', '/api/invitee', {}, (res) => {
				// console.log(res)
				if (res.code) {
					that.code = res.code
					that.has_code = true
				}
			})
		},
		onShow() {
			utils.authGuard()
		},
		onShareAppMessage(res) {
			return utils.share()
		},
		onShareTimeline(res) {
			return utils.share()
		},
		methods: {
			submit() {
				if (!utils.validateInviteCode(this.code)) {
					uni.showToast({
						title: '请填写正确的邀请码',
						icon: 'none'
					})
					return
				}
				var that = this
				utils.request('POST', '/api/invite', {code: this.code}, (res) => {
					// console.log(res)
					if (res.error != 0) {
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
					} else {
						uni.showToast({
							title: '成功',
						})
						that.has_code = true
					}
				})
			}
		},
	}
</script>

<style>

</style>