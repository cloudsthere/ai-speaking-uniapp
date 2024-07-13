<template>
	<view class="px-12 mt-6">
		<view class="mb-2">
			<view class="font-semibold mb-2">头像描述（选填）</view>
			<uni-easyinput type="textarea" v-model="prompt" placeholder="支持中英文，例如：大眼萌妹，甜美可爱"
				primaryColor="#7098e8"></uni-easyinput>
		</view>
		<tui-button :loading="loading" :disabled="loading" class="" size="26" height="70rpx"
			@click="generate">生成头像</tui-button>

		<template v-if="avatars.length > 0">
			<view class="mt-2 mb-2 grid grid-cols-2 gap-2">
				<image @click="select(index)" mode="widthFix" v-for="(avatar, index) in avatars"
					class="avatar-image rounded-lg box-border" :src="avatar.url"
					:class="{'avatar-image-selected': index == selected}" :key="index" />
			</view>
			<tui-button @click="confirm" class="" size="26" height="70rpx">选定</tui-button>
		</template>
	</view>

</template>

<script>
	import tuiButton from "@/components/thorui/tui-button/tui-button.vue"
	import utils from '@/common/utils.js'
	export default {
		components: {
			tuiButton
		},
		data() {
			return {
				prompt: '',
				loading: false,
				avatars: [],
				selected: null,
			}
		},
		methods: {
			select(index) {
				this.selected = index
			},
			confirm() {
				let avatar = this.avatars[this.selected]
				uni.navigateTo({
					url: `/pages/agent/create?avatar_path=${avatar.path}&avatar_url=${avatar.url}`,
				})
			},
			generate() {
				var that = this
				this.avatars = []
				this.loading = true
				this.selected = null
				utils.request('POST', '/api/avatar/generate', {
					prompt: this.prompt
				}, (res) => {
					// console.log(res)
					that.loading = false
					that.avatars = res.avatars
				})

			}
		}
	}
</script>

<style>
	.avatar-image {
		width: unset;
		border: 2px solid transparent;
	}

	.avatar-image-selected {
		border: 2px solid #44b3cc;
		position: relative;
		box-sizing: border-box;

	}


</style>