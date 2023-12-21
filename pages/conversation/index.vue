<template>
	<view v-if="convs.length == 0" class="text-center">
		<image mode="widthFix" class="mt-10" src="@/static/search-no-data.png" style="width: 50%;"></image>
		<view class="mt-2">您还没有会话...</view>
	</view>
	<view class="content" v-else>
		<navigator :url="'/pages/conversation/show?conv_id=' + conv.id"
			class="session flex shadow-md text-sm justify-between p-2 mb-4 mx-2" v-for="conv in convs" :key="conv.id">
			<view class="info">
				<view class="name text-lg">
					{{conv.name}}
				</view>
				<view class="time text-sm text-gray-400">
					{{utils.readableDate(conv.exited_at * 1000)}}
				</view>
			</view>
			<view class="buttons mt-2">
				<button>继续</button>
			</view>
		</navigator>
	</view>
</template>

<script>
	import utils from '@/common/utils.js';


	export default {
		data() {
			return {
				utils,
				convs: [],
			}
		},
		onShow() {
			var that = this
			utils.request('GET', '/api/conversation', {}, (res) => {
				// console.log(res)
				that.convs = res.conversations
			})
		},
		onShareAppMessage(res) {
			return utils.share()
		},
		onShareTimeline(res) {
			return utils.share()
		},
		methods: {

		}
	}
</script>

<style>

</style>