<template>
	<view class="bg-page relative" :style="{paddingBottom: bottom + 'px'}">
		<form @submit="formSubmit">
			<view class="w-full text-center">
				<image class="avatar-wrapper rounded-lg" :src="avatarUrl || '/static/default_avatar.jpg'" />
			</view>
			<button class="cell c-blue-1" plain open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
				<text class="font-semibold">头像</text>
				<image class="w-32" src="/static/icon-rightarrow.svg" />
			</button>
			<view class="flex flex-col gap-1">
				<view class="cell c-blue-1 gap-32">
					<text class="font-semibold">用户名</text>
					<input type="text" :value="name" name="name" class="weui-input flex-auto text-right" />
				</view>
				<text class="text-xs c-gray-3">3-20个字符，由字母、数字和-_符号组成</text>
			</view>
			<view class="cell c-blue-1 gap-32">
				<view class="flex items-center no-shrink gap-16">
					<view class="tag" :key="en_name.name" v-for="en_name in en_names">
						<view class="" @click="selectEnName(en_name.name)">{{en_name.name}}</view>
						<image v-if="en_name.playing" class="w-32" src="/static/icon-voice-selected.png" />
						<image v-else @click="play(en_name)" class="w-32" src="/static/icon-voice-grey.svg" />
					</view>
				</view>

				<image @tap="getEnNames" class="refresh" src="/static/icon-refresh.svg" />
			</view>
			<view class="cell c-blue-1 gap-32">
				<text class="font-semibold">性别</text>
				<view class="flex items-center gap-24">
					<label class="flex items-center gap-8" @click="selectGender(1)">
						<image v-if="gender === 1" class="w-32" src="/static/checkbox-selected.svg" />
						<image v-else class="w-32" src="/static/checkbox.svg" />
						<text>男</text>
					</label>
					<label class="flex items-center gap-8" @click="selectGender(0)">
						<image v-if="gender === 0" class="w-32" src="/static/checkbox-selected.svg" />
						<image v-else class="w-32" src="/static/checkbox.svg" />
						<text>女</text>
					</label>
					<label class="flex items-center gap-8" @click="selectGender(2)">
						<image v-if="gender === 2" class="w-32" src="/static/checkbox-selected.svg" />
						<image v-else class="w-32" src="/static/checkbox.svg" />
						<text>未知</text>
					</label>
				</view>
			</view>
			<button form-type="submit" class="absolute left-0 submit c-white" style="bottom: 56rpx">保存</button>
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
				name: '',
				gender: null,
				en_names: [],
				bottom: getApp().globalData.safeBottom,
			}
		},
		onLoad() {
			utils.request('GET', '/api/user', {}, (res) => {
				this.avatarUrl = res.user.avatar
				// this.nickname = res.user.name
				this.name = res.user.name
				this.gender = res.user.gender

				this.getEnNames()
			})
		},
		methods: {
			selectEnName(en_name) {
				// console.log(en_name)
				this.name = en_name
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
				// let name = e.detail.value.nickname
				// if (!name) {
				// 	uni.showToast({
				// 		title: '昵称不能为空'
				// 	})
				// 	return
				// }

				let name = e.detail.value.name
				if (!name) {
					uni.showToast({
						title: '用户名不能为空',
						icon: 'error'
					})
					return
				}

				if (!/^[0-9a-zA-Z\_/-]{3,20}$/.test(name)) {
					uni.showToast({
						title: '用户名不符合规范',
						icon: 'error'
					})
					return
				}

				let gender = this.gender

				let avatar = this.avatarUrl;
				if (avatar && (avatar.indexOf('http://tmp') == 0 || avatar.indexOf('wxfile://') == 0)) {
					avatar = uni.getFileSystemManager().readFileSync(this.avatarUrl, 'base64')
				}
				// console.log(avatar)

				var that = this
				utils.request('POST', '/api/user', {
					avatar,
					name,
					// en_name,
					gender
				}, (res) => {
					if (res.error == 0) {
					utils.request('get', '/api/user', null, (res) => {
						utils.setUser(res.user)
						uni.showToast({
							title: '保存成功！',
							icon: 'success'
						})
					})
						
					} else {
						uni.showToast({
							title: res.msg,
							icon: 'error'
						})
					}
				})
			}
		}
	}
</script>

<style scoped>
	.bg-page {
		height: 100vh;
		box-sizing: border-box;
		background-color: #fff;
		padding: 64rpx 48rpx 0;
	}

	.avatar-wrapper {
		background-color: #fff;
		line-height: 0;
		padding: 0;
		width: 208rpx;
		height: 208rpx;
		margin-bottom: 64rpx;
	}

	.cell {
		width: 100%;
		height: 100rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 28rpx;
		padding: 0;
		border: none;
	}

	.tag {
		background-color: #FAFAFA;
		border-radius: 16rpx;
		display: flex;
		align-items: center;
		gap: 8rpx;
		padding: 12rpx 20rpx;
		font-size: 26rpx;
	}

	.refresh {
		width: 30rpx;
		height: 30rpx;
	}

	.submit {
		box-sizing: border-box;
		padding: 0;
		margin: 0 48rpx;
		width: 654rpx;
		background: #1CD1AD;
		border-radius: 16rpx;
	}
</style>