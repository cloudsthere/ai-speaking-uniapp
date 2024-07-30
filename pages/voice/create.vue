<template>
	<view class="px-4 mt-4">
		<uni-forms class="mt-4" ref="form" :rules="rules" :modelValue="form" label-position="top">
			<uni-forms-item label="名称" required name="name">
				<uni-easyinput v-model="form.name" placeholder="" />
			</uni-forms-item>
			<uni-forms-item label="描述" name="description">
				<uni-easyinput v-model="form.description" placeholder="" />
			</uni-forms-item>
			<uni-forms-item label="使用权限" name="access" required>
				<uni-data-select v-model="form.access" :localdata="accesses"></uni-data-select>
			</uni-forms-item>
			<tui-button @click="submit" :disabled="is_submitting" class="" size="26" height="70rpx">确定</tui-button>
		</uni-forms>
	</view>
</template>

<script>
	import tuiButton from "@/components/thorui/tui-button/tui-button.vue"
	import utils from '@/common/utils.js';
	export default {
		components: {
			tuiButton,
		},
		data() {

			return {
				rules: {
					name: {
						rules: [{
							required: true,
							errorMessage: '请输入名称'
						}]
					},
					access: {
						rules: [{
							required: true,
							errorMessage: '请选择使用权限'
						}]
					},
				},
				is_submitting: false,
				voice_id: '',
				path: '',
				sample: null,
				engine_voice_id: null,
				preview_text: null,
				preview_audio: null,
				form: {
					access: 'public',
					name: '',
					description: '',
				},
				accesses: [{
						value: 'public',
						text: '公开 · 所有人可用'
					},
					{
						value: 'private',
						text: '私密 · 仅自己可用'
					},
				]
			}
		},
		onLoad(options) {
			console.log(options)
			if (options.engine_voice_id) {
				this.engine_voice_id = options.engine_voice_id
				this.form.name = 'voice-' + utils.generateRandomString(6)
			} else if (options.voice_id) {
				var that = this
				utils.request('get', '/api/voice/' + options.voice_id, {}, (res) => {
					// console.log(res)
					that.voice_id = options.voice_id
					that.engine_voice_id = res.voice.engine_voice_id
					that.form.access = res.voice.access
					that.form.name = res.voice.name
					that.form.description = res.voice.description
				})
			}
		},
		methods: {
			submit() {
				var that = this
				this.$refs.form.validate().then(res => {
					console.log('表单数据信息：', res);
					this.is_submitting = true
					var url = this.voice_id ? '/api/voice/' + this.voice_id : '/api/voice'
					utils.request('post', url, {
						engine_voice_id: this.engine_voice_id,
						name: this.form.name,
						access: this.form.access,
						description: this.form.description,
						voice_id: this.voice_id
					}, (res) => {
						// console.log(res)
						that.is_submitting = false
						if (that.voice_id) {
							uni.navigateTo({
								url: '/pages/mine/voice'
							})
						} else {
							uni.navigateTo({
								url: '/pages/voice/index?tab=my&voice_id=' + res.voice_id
							})

						}
					})
				}).catch(err => {
					console.log('表单错误信息：', err);
				})


			}
		}
	}
</script>

<style>

</style>