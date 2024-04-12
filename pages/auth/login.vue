<template>
	<view class="bg-page flex flex-col items-center box-border w-full">
		<image src="/static/logo.png" class="rounded-half logo"></image>
		<image src="/static/slogan.png" class="logo-text"></image>
		<button plain class="btn btn-primary w-full br-16 c-white fs-32" @click="checkLogin" :open-type="checked ? 'getPhoneNumber' : ''"
			@getphonenumber="decryptPhoneNumber">微信一键登录</button>
		<button @click="toMobile" plain class="btn-default btn w-full c-blue-1 br-16 fs-32">手机号登录/注册</button>
		<view class="flex justify-center items-center" @click="switchChecked">
			<radio :checked="checked" style="transform:scale(0.7);" color="#38b5b3" />
			<view class="c-gray-4 fs-26">
				我已阅读并同意
				<navigator url="/pages/home/privacy" class="text-primary inline c-green-1">隐私政策</navigator>
				和
				<navigator url="/pages/home/protocol" class="text-primary inline c-green-1">用户协议</navigator>
			</view>
		</view>
	</view>
</template>

<script>
	import utils from '@/common/utils.js';

	export default {
		data() {
			return {
				checked: false,
			}
		},
		onShareAppMessage(res) {
			return utils.share()
		},
		onShareTimeline(res) {
			return utils.share()
		},
		methods: {
			switchChecked() {
				// console.log('switch')
				this.checked = !this.checked
			},
			check() {
				if (this.checked) {
					return true;
				} else {
					uni.showToast({
						title: '请先同意隐私条款',
						icon: 'none'
					})
					return false
				}
			},
			checkLogin() {
				if (!this.check()) {
					return;
				}
				uni.showLoading({
					title: '加载中'
				})
			},
			decryptPhoneNumber(e) {
				if (!this.check()) {
					return;
				}

				if (!e.detail.code) {
					uni.hideLoading()
					return;
				}

				// console.log(e.detail)
				var that = this
				utils.request('POST', '/api/login/code', e.detail, (res) => {
					// console.log(res)
					if (res.error == 0) {
						utils.setUser(res.user)
						utils.setToken(res.token)
						uni.showToast({
							title: '成功',

						})
						setTimeout(() => {
							uni.navigateBack({
								fail() {
									uni.switchTab({
										url: '/pages/mine/mine'
									})
								}
							})
							
						}, 1500)
					}
				})
			},
			toMobile() {
				uni.navigateTo({
					url: "/pages/auth/mobile"
				})
			}

		}
	}
</script>

<style scoped>
	page-meta {
		background-color: #fff;
	}
	.bg-page {
		background-image: url(/static/chat-bg.jpg);
		background-size: 100% auto;
		background-repeat: no-repeat;
		padding: 70rpx 80rpx 0;
	}
	.logo {
		width: 208rpx;
		height: 108rpx;
		margin-bottom: 32rpx;
	}
	.logo-text {
		width: 244rpx;
		height: 86rpx;
		margin-bottom: 96rpx;
	}
	
	.btn-primary {
		background-color: #1CD1AD;
		padding: 30rpx 0;
		line-height: 1;
		margin-bottom: 24rpx;
		border: none;
		color: white;
		border: none;
	}
	
	.btn-default {
		background-color: #F3F4F6;
		padding: 30rpx 0;
		line-height: 1;
		margin-bottom: 46rpx;
		border: none;
	}
</style>