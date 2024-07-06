<template>
	<view class="px-4 mt-4">
		<view class="flex justify-center">
			<view class="relative" @click="openAvatar">
				<image v-if="avatar_url" :src="avatar_url" class="avatar rounded-lg" />
				<image v-else src="@/static/mate-avater.png" class="avatar rounded-lg" />
				<uni-icons type="plus-filled" class="absolute avatar-add"></uni-icons>
			</view>
		</view>
		<uni-forms class="mt-4" ref="form" :rules="rules" :modelValue="form" label-position="top">
			<uni-forms-item label="名称" required name="name">
				<uni-easyinput v-model="form.name" placeholder="例如: Albert Einstein" />
			</uni-forms-item>
			<uni-forms-item label="简介" name="subtitle">
				<uni-easyinput v-model="form.subtitle" placeholder="一句话介绍你的角色" />
			</uni-forms-item>
			<uni-forms-item label="描述" name="description">
				<uni-easyinput type="textarea" v-model="form.introduction"
					placeholder="角色的自我描述，支持中英文，例如: I am Elon Reeve Musk, CEO of Tesla. / 我是尼尔·阿姆斯特朗, 第一个登月的人类。" />
			</uni-forms-item>
			<uni-forms-item label="问候语" name="greeting">
				<uni-easyinput suffixIcon="refreshempty" type="textarea" v-model="form.greeting"
					placeholder="例如: Hello, I am Albert Einstein. Ask me anything about my scientific contributions." />
			</uni-forms-item>
			<uni-forms-item label="访问权限" name="access" required>
				<uni-data-select v-model="form.access" :localdata="accesses"></uni-data-select>
			</uni-forms-item>
			<tui-button @click="submit" class="" size="26" height="70rpx">确定</tui-button>
		</uni-forms>
	</view>

	<uni-popup ref="avatar" type="bottom" safeArea backgroundColor="#fff">
		<tui-list-view title="">
			<tui-list-cell>
				<navigator url="/pages/home/avatar" class="text-center">AI生成</navigator>
			</tui-list-cell>
			<tui-list-cell @click="selectFromLocal">
				<view class="text-center">相册上传</view>
			</tui-list-cell>
		</tui-list-view>
	</uni-popup>

</template>

<script>
	import tuiListView from "@/components/thorui/tui-list-view/tui-list-view.vue"
	import tuiListCell from "@/components/thorui/tui-list-cell/tui-list-cell.vue"
	import tuiButton from "@/components/thorui/tui-button/tui-button.vue"
	import utils from '@/common/utils.js'

	export default {
		components: {
			tuiListView,
			tuiListCell,
			tuiButton,
		},
		data() {
			return {
				avatar_path: '',
				avatar_url: '',
				form: {
					access: 'public'
				},
				accesses: [{
						value: 'public',
						text: '公开 · 所有人可对话'
					},
					{
						value: 'unlisted',
						text: '不被发现 · 通过链接分享可对话'
					},
					{
						value: 'private',
						text: '私密 · 仅自己可对话'
					},
				]
			}
		},
		onLoad(options) {
			console.log(options)
			if (options.avatar_path) {
				this.avatar_path = options.avatar_path
				this.avatar_url = options.avatar_url
			}
		},
		methods: {
			openAvatar() {
				this.$refs.avatar.open('bottom')
			},
			openGenerateAvatar() {
				// console.log('open')
				this.$refs.generateAvatar.open('bottom')
			},
			selectFromLocal() {
				var that = this
				uni.chooseImage({
					count: 1,
					success: (chooseImageRes) => {
						const tempFilePaths = chooseImageRes.tempFilePaths;
						uni.uploadFile({
							header: {
								Authorization: 'Bearer ' + utils.getToken(),

							},
							url: utils.domain + '/api/avatar/upload', //仅为示例，非真实的接口地址
							filePath: tempFilePaths[0],
							name: 'avatar',
							success: (uploadFileRes) => {
								let avatar = JSON.parse(uploadFileRes.data);
								console.log(avatar)
								that.avatar_url = avatar.url
								that.avatar_path = avatar.path
								that.$refs.avatar.close()
							}
						});
					}
				})
			},
			submit() {}
		}
	}
</script>

<style>
	.avatar {
		width: 120rpx;
		height: 120rpx;
	}

	.avatar-add {
		bottom: -10rpx;
		right: -10rpx;
	}

	.ganerate-avatar {
		height: 100vh;
	}
</style>