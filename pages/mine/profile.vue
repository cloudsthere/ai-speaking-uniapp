<template>
	<view>
		<form @submit="formSubmit">
			<button class="avatar-wrapper" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
				<image class="avatar" :src="avatarUrl"></image>
			</button>
			<view class="">昵称</view>
			<input type="nickname" :value="nickname" name="nickname" class="weui-input" placeholder="请输入昵称" />
			<view class="">英文名</view>
			<input type="text" :value="en_name" name="en_name" class="weui-input" placeholder="请输入英文名" />
			<view class="flex gap-3">
				<view class="" v-for="en_name in en_names">
					<view class="" @click="selectEnName(en_name.name)">{{en_name.name}}</view>
					<image @click="play(en_name)" class="w-32" src="/static/icon-voice-grey.svg" />
				</view>
			</view>
			<button @click="getEnNames">换一批</button>
			<view class="">性别</view>
			<radio-group name="gender">
				<label @click="selectGender(1)" >
					<radio :value="1" :checked="gender == 1"  /><text>男</text>
				</label>
				<label @click="selectGender(0)" >
					<radio :value="0" :checked="gender == 0"  /><text>女</text>
				</label>
				<label @click="selectGender(2)" >
					<radio :value="2" :checked="gender == 2"  /><text>未知</text>
				</label>
			</radio-group>
			<button form-type="submit">提交</button>
		</form>
	</view>
</template>

<script>
	import utils from '@/common/utils.js';
	import player from '@/common/player.js';

	export default {
		data() {
			return {
				avatarUrl: '',
				nickname: '',
				en_name: '',
				gender: null,
				en_names: []
			}
		},
		onLoad() {
			var that = this
			utils.request('GET', '/api/user', {}, (res) => {
				console.log(res)
				that.avatarUrl = res.user.avatar
				that.nickname = res.user.name
				that.en_name = res.user.en_name
				that.gender = res.user.gender

				that.getEnNames()
			})
		},
		methods: {
			selectEnName(en_name) {
				console.log(en_name)
				this.en_name = en_name
			},
			selectGender(gender) {
				console.log('select', gender)
				this.gender = gender
			},
			getEnNames() {
				var that = this
				utils.request('GET', '/api/en-names', {
					gender: this.gender
				}, (res) => {
					// console.log(res)
					that.en_names = res.en_names;
				})
			},
			play(cd) {
				player.play(cd)
			},
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

				let en_name = e.detail.value.en_name
				if (!en_name) {
					uni.showToast({
						title: '英文名不能为空',
						icon: 'error'
					})
					return
				}
				
				if (!/^[0-9a-zA-Z\_]+$/.test(en_name)) {
					uni.showToast({
						title: '英文名不规范',
						icon: 'error'
					})
					return
				}

				let gender = e.detail.value.gender

				let avatar = this.avatarUrl;
				if (avatar.indexOf('http://tmp') == 0) {
					avatar = uni.getFileSystemManager().readFileSync(this.avatarUrl, 'base64')
				}
				// console.log(avatar)

				var that = this
				utils.request('POST', '/api/user', {
					avatar,
					name,
					en_name,
					gender
				}, (res) => {
					console.log(res)

				})
			}
		}
	}
</script>

<style>

</style>