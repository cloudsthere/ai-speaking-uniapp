<template>
	<view class="content pt-10 px-4 text-center">
		<image src="@/static/logo.png" class="m-auto mb-8 logo"></image>
		<view class="flex flex-col gap-4">
			<button class="btn btn-primary" @click="checkLogin" :open-type="checked ? 'getPhoneNumber' : ''"
				@getphonenumber="decryptPhoneNumber">一键登录</button>
			<button @click="toMobile" class="btn-default btn">手机号登录/注册</button>
		</view>
		<view class="text-sm text-gray-600 mt-4 flex justify-center items-center">
			<radio @click="switchChecked" :checked="checked" style="transform:scale(0.7);" color="#38b5b3" />
			<view @click="switchChecked" class="text-gray-400">
				我已阅读并同意<navigator url="/pages/home/privacy" class="text-primary inline underline">隐私政策</navigator>和<navigator url="/pages/home/protocol" class="text-primary inline underline">用户协议</navigator>
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

<style>
	.logo {
		width: 100px;
		height: 100px;
	}
</style>