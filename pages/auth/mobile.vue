<template>
	<view class="bg-page flex flex-col items-center box-border w-full">
		<image src="/static/default_avatar.jpg" class="rounded-half logo"></image>
		<view class="flex flex-col gap-24 w-full">
			<view class="relative br-16 input-box c-blue-1 flex items-center fs-28">
				<view class="flex items-center justify-center"><text>+86</text></view>
				<input name="phone" type="number" v-model="phone" placeholder="手机号" class="border-none text-left"/>
			</view>
			<view class="relative br-16 input-box c-blue-1 flex items-center fs-28 justify-space-between">
				<input name="code" v-model="code" placeholder="验证码" type="number" class="border-none flex-auto"/>
				<view @tap="sendCode" class="z-10 flex items-center justify-center">
					<text class="c-green-1" v-show="['none', 'sending'].includes(status)">发送验证码</text>
					<text class="c-gray-1" v-show="['counting'].includes(status)">{{counter}}s</text>
				</view>
			</view>
		</view>
		<button class="btn btn-primary w-full br-16 c-white fs-32" @click="login">登录/注册</button>
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
				phone: '',
				code: '',
				// none, sending, counting
				status: 'none',
				counter: 60,
			}
		},
		onShareAppMessage(res) {
			return utils.share()
		},
		onShareTimeline(res) {
			return utils.share()
		},
		methods: {
			sendCode() {
				if (['sending', 'counting'].includes(this.status)) {
					console.log('not in')
					return
				}
				
				if (!this.validateMobile()) {
					return false;
				}
				
				this.status = 'sending'
				utils.request('GET', '/api/send-code', {mobile: this.phone}, (res) => {
					if (res.error == 0) {
						this.status = 'counting'
						var sil = setInterval(() => {
							if (this.counter == 0) {
								this.status = 'none';
								this.counter = 60
								clearInterval(sil)
							}
							this.counter--;
						}, 1000)
					}
				})
			},
			validateMobile() {
				console.log('mobile', "'" + this.phone + "'")
				if (!/^(13[0-9]|14[5-9]|15[0-3,5-9]|16[6]|17[0-8]|18[0-9]|19[0-3,5-9])\d{8}$/.test(this.phone)) {
					uni.showToast({
						title: '请输入正确的手机号',
						icon: 'none'
					})
					return false;
				}
				return true;
			},
			login() {
				if (!this.checked) {
					uni.showToast({
						title: '请先同意隐私条款',
						icon: 'none'
					})
					return false
				}
				
				// console.log('switch')
				if (!this.validateMobile()) {
					return false;
				}
				
				if (!/^\d{6}$/.test(this.code)) {
					uni.showToast({
						title: '请输入6位验证码',
						icon: 'none'
					})
					return false;
				}
				
				utils.request('POST', '/api/login/mobile', {mobile: this.phone, code: this.code}, (res) => {
					if (res.error != 0) {
						uni.showToast({
							title: '验证码错误',
							icon: 'none'
						})
						return;
					} else {
						utils.setUser(res.user)
						utils.setToken(res.token)
						uni.showToast({
							title: '成功',
						
						})
						setTimeout(() => {
							uni.switchTab({
								url: '/pages/mine/mine'
							})
						}, 1500)
					}
				})
			},
			switchChecked() {
				// console.log('switch')
				this.checked = !this.checked
			},
		},
	}
</script>

<style>
	.bg-page {
		background-image: url(/static/chat-bg.jpg);
		background-repeat: no-repeat;
		padding: 70rpx 80rpx 0;
	}
	.logo {
		width: 208rpx;
		height: 208rpx;
		margin-bottom: 70rpx;
	}
	.input-box {
		background: #F3F4F6;
		height: 104rpx;
		padding: 0 40rpx;
		gap: 32rpx;
	}
	.btn-primary {
		background-color: #1CD1AD;
		padding: 30rpx 0;
		line-height: 1;
		margin-bottom: 24rpx;
		border: none;
		margin-top: 56rpx;
		margin-bottom: 32rpx;
	}
</style>