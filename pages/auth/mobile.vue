<template>
	<view class="content pt-10 px-4 text-center">
		<image src="@/static/logo.png" class="m-auto mb-8 logo"></image>
		<view class="flex flex-col gap-4">
			<view class="relative">
				<view class="text-gray-600 absolute left-0 top-0 bottom-0 flex flex-col items-center justify-center"><text>+86</text></view>
				<input name="phone" type="number" v-model="phone" placeholder="手机号" class="pl-10 py-2 border-b border-x-0 border-t-0 text-left border-gray-200 border-solid"/>
			</view>
			<view class="relative">
				<input name="code" v-model="code" placeholder="验证码" type="number" class="py-2 border-b border-x-0 border-t-0 text-left border-gray-200 border-solid"/>
				<view @tap="sendCode" class="z-10 text-primary absolute pl-2 right-0 top-0 bottom-0 flex flex-col items-center justify-center">
					<text v-show="['none', 'sending'].includes(status)">发送验证码</text>
					<text v-show="['counting'].includes(status)">{{counter}}秒后重发</text>
				</view>
			</view>
		</view>
		<view class="flex flex-col gap-4 mt-4">
			<button class="btn btn-primary" @click="login" >登录/注册</button>
		</view>
		<view class="text-sm text-gray-600 mt-4 flex justify-center items-center">
			<radio @click="switchChecked" :checked="checked" style="transform:scale(0.7);" color="#38b5b3"/>
			<view @click="switchChecked" class="text-gray-400">
				我已阅读并同意<navigator url="/pages/home/privacy" class="text-primary inline">隐私政策</navigator>
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
				var that = this
				if (['sending', 'counting'].includes(this.status)) {
					console.log('not in')
					return
				}
				
				if (!this.validateMobile()) {
					return false;
				}
				
				this.status = 'sending'
				utils.request('GET', '/api/send-code', {mobile: this.phone}, (res) => {
					// console.log(res)
					if (res.error == 0) {
						that.status = 'counting'
						var sil = setInterval(() => {
							if (that.counter == 0) {
								that.status = 'none';
								that.counter = 60
								clearInterval(sil)
							}
							that.counter--;
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
	.logo {
		width: 100px;
		height: 100px;
	}
</style>