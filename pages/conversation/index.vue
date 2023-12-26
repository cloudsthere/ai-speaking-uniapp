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
					{{conv.brief}}
				</view>
			</view>
			<view class="buttons mt-2">
				<button>继续</button>
			</view>
			<view class="buttons mt-2">
				<button @tap.stop="deleteConv(conv.id)">删除</button>
			</view>
			<view class="buttons mt-2">
				<button @tap.stop="top(conv.id)">置顶</button>
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
			deleteConv(conv_id) {
				// console.log(conv_id)
				utils.request('POST', '/api/conversation/' + conv_id + '/delete', {}, (res) => {
					console.log(res)
					// that.convs = res.conversations
				})
			},
			top(conv_id) {
				// console.log(conv_id)
				utils.request('POST', '/api/conversation/' + conv_id + '/top', {}, (res) => {
					console.log(res)
					// that.convs = res.conversations
				})
			}
		}
	}
</script>

<style>

</style>