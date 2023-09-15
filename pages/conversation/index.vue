<template>
	<view class="content">
		<view class="session flex shadow-md text-sm justify-between p-4" v-for="conv in convs">
			<view class="info">
				<view class="name">
					{{conv.name}}
				</view>
				<view class="time">
					{{conv.exited_at}}
				</view>
			</view>
			<view class="buttons">
				<button>继续</button>
			</view>
		</view>
	</view>
</template>

<script>
	import utils from '@/utils.js';
	
	export default {
		data() {
			return {
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
