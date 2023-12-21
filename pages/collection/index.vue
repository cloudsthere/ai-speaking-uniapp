<template>
	<view class="content">
		<view class="flex justify-between bg-white p-4">
			<view class="text-2xl">我的单词本</view>
			<view class="flex gap-2 justify-between items-center text-sm">
				<text class="text-gray-400">{{count}}词</text>	
				<!-- <view class="bg-gray-100 text-gray-600 p-2 rounded-lg">时间倒序</view> -->
			</view>
		</view>
		
		<view class="" :key="collection.date" v-for="collection in collections">
			<view class="px-4 text-gray-400 py-1 text-sm">{{collection.date}}</view>
			<view @click="lookup(c.dictionary.word)" v-for="c in collection.collections" :key="c.id" class="bg-white flex px-4 items-center gap-4 py-4 border-b border-gray-100">
				<uni-icons @click="play(c.dictionary)" :class="{playing: c.dictionary.playing}"
					custom-prefix="iconfont" type="icon-laba" size="20"></uni-icons>
					<view class="flex flex-col gap-1" style="min-width:0;flex-shrink:1;">
						<text class="text-base text-xl">{{c.dictionary.word}}</text>
						<text class="text-sm text-gray-400 overflow-hidden whitespace-nowrap text-ellipsis">{{c.dictionary.brief}}</text>
					</view>
			</view>
		</view>
	</view>
	<dictionary ref="dictionary"></dictionary>
</template>

<script>
	import utils from '@/common/utils.js';
	import player from '@/common/player.js';
	import dictionary from '../component/dictionary.vue';
	// const innerAudioContext = utils.createInnerAudioContext()
	
	export default {
		components: {
			dictionary,
		},
		data() {
			return {
				collections: [],
				// dict: null,
				count: '',
			}
		},
		onLoad() {
			var that = this
			utils.request('GET', '/api/collection', {}, (res) => {
				// console.log(res)
				that.collections = res.collections
				that.count = res.count
			})
		},
		methods: {
			play(cd) {
				// innerAudioContext.go(cd)
				player.play(cd)
			},
			lookup(word) {
				// console.log(word)
				// return;
				this.$refs.dictionary.lookup(word)
			}
		}
	}
</script>

<style lang="scss">
	page {
		background-color: $app-bg-gray;
	}
	
</style>
