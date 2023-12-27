<template>
	<view class="content">

		<view class="p-4 bg-white">
			<view class="flex gap-4 items-start border-b border-gray-100 items-stretch pb-4">
				<navigator url="/pages/mine/profile" class="flex gap-4" v-if="user">
					<image :src="user.avatar" class="avatar" mode=""></image>
					<view class="flex flex-col justify-between">
						<view class="text-xl font-medium">
							{{user.name}}
						</view>
						<view class="flex items-center gap-1">
							<image class="w-6 h-6" src="@/static/icon-no-member.png" v-if="member.plan == 'none'"
								mode=""></image>
							<image class="w-6 h-6" src="@/static/icon-member.png" v-else mode=""></image>
							<text class="text-sm text-gray-400">{{member.plan_name}}</text>
						</view>
					</view>
					<view>></view>
				</navigator>
				<navigator url="/pages/auth/login"
					class="login-text w-full m-auto flex flex-col justify-center items-center" v-else>
					<view class="text-xl">登录/注册</view>
				</navigator>
			</view>
			<view class="flex justify-between px-4">
				<view class="flex flex-col justify-between items-center pt-4 gap-2">
					<view class="text-gray-400 text-sm">套餐剩余</view>
					<view class="text-xl">{{member.duration}}</view>
				</view>
				<view class="flex flex-col justify-between items-center pt-4 gap-2">
					<view class="text-gray-400 text-sm">已使用</view>
					<view class="text-xl">{{member.used_duration}}</view>
				</view>
				<view class="flex flex-col justify-between items-center pt-4 gap-2">
					<view class="text-gray-400 text-sm">已赠送</view>
					<view class="text-xl">{{member.given_duration}}</view>
				</view>
			</view>
		</view>
		<view class="px-4 bg-white mt-4">
			<view class="flex items-center gap-3 py-4">
				<navigator url="/pages/home/price"
					class="w-full bg-primary text-color-white flex justify-between rounded p-2 items-center">
					<view class="text-white">加入会员<span class="px-1">•</span>享更多权益</view>
					<view class="bg-white rounded-3xl text-primary py-2 px-3 text-xs">购买会员</view>
				</navigator>
			</view>
			<navigator url="/pages/mine/promote" class="flex items-center gap-3 border-b border-gray-100 py-4">
				<uni-icons custom-prefix="iconfont" type="icon-jiangli" size="20"></uni-icons>
				<view class="">推广有奖</view>
			</navigator>
			<view class="flex items-center gap-3 py-4">
				<uni-icons custom-prefix="iconfont" type="icon-fanyi" size="20"></uni-icons>
				<view class="">
					钱包
				</view>
			</view>
		</view>

		<view class="px-4 bg-white mt-4">
			<navigator url="/pages/mine/invite-code" class="flex justify-between border-b border-gray-100 py-4">
				<view class="flex items-center gap-3 ">
					<uni-icons custom-prefix="iconfont" type="icon-yaoqing" size="20"></uni-icons>
					<view class="">填写邀请码</view>
				</view>
				<view class="text-gray-300">&gt;</view>
			</navigator>
			<view class="flex items-center gap-3 py-4" @tap="showLogout">
				<uni-icons custom-prefix="iconfont" type="icon-tuichu" size="20"></uni-icons>
				<view class="">
					退出登录
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import utils from '@/common/utils.js';

	export default {
		data() {
			return {
				user: null,
				member: {
					duration: '-',
					used_duration: '-',
					given_duration: '-',
				},
			}
		},
		onLoad() {

		},
		onShow() {
			// console.log('onshow')
			// 登录页跳来
			this.user = utils.getUser()

			var that = this
			utils.request('GET', '/api/member', {}, (res) => {
				// console.log(res)
				that.member = res.member
			})
			
			// utils.request('GET', '/api/user', {}, (res) => {
			// 	// console.log(res)
			// 	that.user = res.user
			// })
		},
		onShareAppMessage(res) {
			return utils.share()
		},
		onShareTimeline(res) {
			return utils.share()
		},
		methods: {
			getUserInfo() {
				// uni.getUserProfile({
				// 	desc: '完善用户资料',
				// 	success(res) {
				// 		console.log(res)
				// 	}
				// })
				wx.getUserProfile({
				      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
				      success: (res) => {
				        console.log(res)
				      }
				    })
			},
			bindGetUserInfo(e) {
				console.log(e.detail.userInfo)
				//
			},
			showLogout() {
				var that = this
				uni.showModal({
					// title: '确认退出登录吗',
					content: '确认退出登录吗',
					success: function(res) {
						if (res.confirm) {
							// console.log('用户点击确定');
							that.logout()
						} else if (res.cancel) {
							// console.log('用户点击取消');
						}
					}
				});
			},
			logout() {
				if (this.user) {
					// console.log('request')
					utils.request('POST', '/api/logout', {}, (res) => {
						utils.deleteUser()
						utils.setToken(res.token)
						uni.reLaunch({
							url: '/pages/mine/mine',
						})
					})
				}

			}
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

	.login-text {
		height: 80px;
	}

	.bg-gradient {
		background-image: linear-gradient(to bottom, #38b5b3, #4dc3c1, #60d2d0, #72e0de, #83efed);
	}
</style>