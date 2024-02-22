<template>
	<view class="px-4 text-center" v-if="conv">
		<image class="rounded-full" :src="conv.avatar"></image>
		<view class="text-gray-600">
			{{conv.name}}
		</view>
		<view class="">{{conv.brief}}</view>
		<view class="mt-4 bg-white">
			<navigator :url="'/pages/conversation/teacher?conv_id=' + conv.id" class="flex justify-between">
				<view class="">声音</view>
				<view class="">{{conv.teacher.tags.join(',')}}</view>
			</navigator>
			<view class="" @click="clear">清除上下文</view>
		</view>
	</view>
</template>

<script>
	import utils from '@/common/utils.js';
	
	export default {
		data() {
			return {
				conv: null,
				conv_id: null
			}
		},
		onLoad(options) {
			this.conv_id = options.conv_id
		},
		onShow(options) {
			// console.log(options)
			var that = this
			utils.request('get', '/api/conversation/' + this.conv_id + '/setting', {}, (res) => {
				// console.log(res)
				that.conv = res.conversation
			})
		},
		methods: {
			clear() {
				utils.request('post', '/api/message/delete', {conv_id: this.conv.id}, (res) => {
					// console.log(res)
					if (res.error == 0) {
						uni.showToast({
							title: '删除成功',
						})
					}
				})
			}
		}
	}
</script>

<style>
</style>