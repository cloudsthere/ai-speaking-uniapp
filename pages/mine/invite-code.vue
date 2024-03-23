<template>
	<view class="content">
		<image class="banner" src="@/static/bg-sharecode.jpg" mode=""></image>
		<view class="p-50">
			<view>
				<view v-if="has_code" class="w-fll text-center text-xl box-border">{{code}}</view>
				<input v-else name="code" v-model="code" placeholder="邀请码" type="text"
					class="box-border input" />
			</view>
			<view class="box-border mt-32">
				<button class="box-border fs-32 c-white btn btn-primary" v-if="!has_code" @click="submit" >提交</button>
			</view>
			<view class="flex justify-center items-center c-blue-1 fs-24 mt-64">
				<navigator url="/pages/mine/promote" class="text-primary">生成我的邀请码，赚取推广奖励→</navigator>
			</view>
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

<style scoped>
.banner {
	width: 100%;
	height: 348rpx;
}
.p-50 {
	padding: 0 50rpx;
}
.input {
	height: 112rpx;
	padding: 0 40rpx;
	line-height:　112rpx;
	background-color: #F3F4F6;
	font-size: 36rpx;
	font-weight: 600;
	border-radius: 16rpx;
	width: 100%;
}
.btn-primary {
	background-color: #1CD1AD;
	text-align: center;
	height: 104rpx;
	line-height: 104rpx;
	width: 100%;
}
.mt-64 {
	margin-top: 64rpx;
}
</style>