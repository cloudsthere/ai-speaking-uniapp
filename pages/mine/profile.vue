<template>
	<view>
		<form @submit="formSubmit">
			<button class="avatar-wrapper" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
				<image class="avatar" :src="avatarUrl"></image>
			</button>
			<input type="nickname" :value="nickname" name="nickname" class="weui-input" placeholder="请输入昵称" />
			<button form-type="submit">提交</button>
		</form>
	</view>
</template>

<script>
	const defaultAvatarUrl =
		'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

	import utils from '@/common/utils.js';

	export default {
		data() {
			return {
				avatarUrl: defaultAvatarUrl,
				nickname: ''
			}
		},
		onLoad() {
			var that = this
			utils.request('GET', '/api/user', {}, (res) => {
				// console.log(res)
				that.avatarUrl = res.user.avatar
				that.nickname = res.user.name
			})
		},
		methods: {
			onChooseAvatar(e) {
				const {
					avatarUrl
				} = e.detail
				this.avatarUrl = avatarUrl
			},
			formSubmit(e) {
				// console.log(e.detail.value)
				// console.log(this.avatarUrl)
				// console.log(this.nickname)
				let name = e.detail.value.nickname
				if (!name) {
					uni.showToast({
						title: '昵称不能为空'
					})
					return
				}
				
				let avatar = this.avatarUrl;
				if (avatar.indexOf('http://tmp') == 0) {
					avatar = uni.getFileSystemManager().readFileSync(this.avatarUrl, 'base64')
				}
				// console.log(avatar)

				var that = this
				utils.request('POST', '/api/user', {
					avatar,
					name,
				}, (res) => {
					console.log(res)

				})
			}
		}
	}
</script>

<style>

</style>