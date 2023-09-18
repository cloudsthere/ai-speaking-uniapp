<template>
	<view class="content pt-10 px-4 text-center">
		<image src="@/static/logo.png" class="m-auto mb-8 logo"></image>
		<view class="flex flex-col gap-4">
			<view class="relative">
				<view class="text-gray-600 absolute left-0 top-0 bottom-0 flex flex-col items-center justify-center"><text>+86</text></view>
				<input name="mobile" type="number" placeholder="手机号" class="pl-10 py-2 border-b border-x-0 border-t-0 text-left border-gray-200 border-solid"/>
			</view>
			<view class="relative">
				<input name="code" placeholder="验证码" type="number" class="py-2 border-b border-x-0 border-t-0 text-left border-gray-200 border-solid"/>
				<view class="border-l text-primary absolute pl-2 right-0 top-0 bottom-0 flex flex-col items-center justify-center">
					<text>发送验证码</text>
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
	import utils from '@/utils.js';
	
	export default {
		data() {
			return {
				checked: false,
			}
		},
		methods: {
			sendCode() {
				
			},
			login() {
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