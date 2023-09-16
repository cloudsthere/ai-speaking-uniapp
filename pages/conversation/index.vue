<template>
	<view class="content">
		<navigator :url="'/pages/conversation/show?conv_id=' + conv.id" class="session flex shadow-md text-sm justify-between p-2 mb-4 mx-2" v-for="conv in convs" :key="conv.id">
			<view class="info">
				<view class="name text-lg">
					{{conv.name}}
				</view>
				<view class="time text-sm text-gray-400">
					{{utils.readableDate(conv.exited_at)}}
				</view>
			</view>
			<view class="buttons mt-2">
				<button>继续</button>
			</view>
		</navigator>
	</view>
</template>

<script>
	import utils from '@/utils.js';
	
	export default {
		data() {
			return {
				utils,
				convs: [],
			}
		},
		onLoad() {
			var that = this
			utils.request('GET', '/api/conversation', {}, (res) => {
				// console.log(res)
				that.convs = res.conversations
			})
		},
		methods: {
			
		}
	}
</script>

<style>

</style>
