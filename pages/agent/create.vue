<template>
	<view class="px-4 py-4">
		<view class="flex justify-center">
			<view class="relative" @click="openAvatar">
				<image v-if="form.avatar_url" :src="form.avatar_url" class="avatar rounded-lg" />
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
				<uni-easyinput type="textarea" v-model="form.description"
					placeholder="角色的自我描述，支持中英文，例如: I am Elon Reeve Musk, CEO of Tesla. / 我是尼尔·阿姆斯特朗, 第一个登月的人类。" />
			</uni-forms-item>
			<uni-forms-item label="问候语" name="greeting">
				<uni-easyinput @iconClick="greeting" suffixIcon="refreshempty" type="textarea" v-model="form.greeting"
					placeholder="例如: Hello, I am Albert Einstein. Ask me anything about my scientific contributions." />
			</uni-forms-item>
			<uni-forms-item label="声音" name="voice" required>
				<view @click="selectVoice">
					<uni-easyinput v-model="form.voice_name" placeholder="" :disabled="true" suffixIcon="right"
						:styles="{disableColor: '#fff'}" />
				</view>
			</uni-forms-item>
			<uni-forms-item label="访问权限" name="access" required>
				<uni-data-select v-model="form.access" :localdata="accesses"></uni-data-select>
			</uni-forms-item>
			<tui-button :loading="is_submitting" @click="submit" class="" size="26" height="70rpx">确定</tui-button>
		</uni-forms>
	</view>

	<uni-popup ref="avatar" type="bottom" safeArea backgroundColor="#fff">
		<tui-list-view title="">
			<tui-list-cell>
				<navigator url="/pages/agent/avatar" class="text-center">AI生成</navigator>
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

	const default_form = {
		access: 'public',
		name: '',
		subtitle: '',
		description: '',
		greeting: '',
		avatar_path: '',
		avatar_url: '',
		voice_name: 'Alice',
		voice_id: 1,
		voice_tab: 'all',
	}
	
	export default {
		components: {
			tuiListView,
			tuiListCell,
			tuiButton,
		},
		data() {
			return {
				is_submitting: false,
				rules: [],
				form: default_form,
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
			console.log(uni.getStorageSync('create_form'))
			var that = this
			// 有agent_id，一定是从列表页进入
			if (options.agent_id) {
				// 发请求
				utils.request('get', '/api/agent/' + options.agent_id, {}, (res) => {
					// console.log(res)
					that.form.agent_id = res.agent.id
					that.form.access = res.agent.access
					that.form.avatar_url = res.agent.avatar
					that.form.description = res.agent.description
					that.form.greeting = res.agent.greeting
					that.form.name = res.agent.name
					that.form.subtitle = res.agent.subtitle
					that.form.voice_id = res.agent.voice_id
					that.form.voice_name = res.agent.voice.name
				})
			} else {
				this.form = uni.getStorageSync('create_form') || default_form
			}


			if (options.avatar_path) {
				this.form.avatar_path = options.avatar_path
				this.form.avatar_url = options.avatar_url
			}

			if (options.voice_id) {
				this.form.voice_id = options.voice_id
				this.form.voice_tab = options.voice_tab
				this.form.voice_name = options.voice_name
			}
		},
		onHide() {
			uni.setStorageSync('create_form', this.form)
		},
		onShow() {},
		methods: {
			openAvatar() {
				this.$refs.avatar.open('bottom')
			},
			openGenerateAvatar() {
				// console.log('open')
				this.$refs.generateAvatar.open('bottom')
			},
			greeting() {
				var that = this
				utils.request('POST', '/api/agent/greeting', {
					name: this.form.name,
					description: this.form.description,
				}, (res) => {
					console.log(res)
					that.form.greeting = res.greeting
				})
			},
			selectVoice() {
				uni.navigateTo({
					url: `/pages/voice/index?voice_id=${this.form.voice_id}&voice_tab=${this.form.voice_tab}`
				})
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
								// console.log(avatar)
								that.form.avatar_url = avatar.url
								that.form.avatar_path = avatar.path
								that.$refs.avatar.close()
							}
						});
					}
				})
			},
			submit() {
				var that = this
				this.is_submitting = true;
				utils.request('post', '/api/agent', {
					access: this.form.access,
					name: this.form.name,
					subtitle: this.form.subtitle,
					description: this.form.description,
					greeting: this.form.greeting,
					avatar_path: this.form.avatar_path,
					voice_id: this.form.voice_id,
					agent_id: this.form.agent_id,
				}, (res) => {
					// console.log(res)
					that.is_submitting = false
					uni.clearStorageSync('create_form')
					uni.showToast({
						title: '保存成功'
					})
					setTimeout(() => {
						uni.navigateTo({
							url: '/pages/conversation/show?agent_id=' + res.agent_id
						})
					}, 1500)
				})
			}
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