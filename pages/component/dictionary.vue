<template>
	<uni-popup ref="popup" type="bottom" background-color="#fff">
		<view class="" style="max-height: 60vh;">
			<view class="bg-white" style="height:20px;"></view>
			<view class="px-4 pb-4 bg-white overflow-scroll"  v-if="dict" style="max-height: calc(60vh - 20px);">
				<view class="text-gray-800 text-sm flex flex-col gap-2">
					<view class="text-semibold flex gap-3 items-center">
						<text class="text-2xl">{{dict.word}}</text>
						<uni-icons @click="play(dict)" :class="{playing: dict.playing}" custom-prefix="iconfont"
							type="icon-laba" size="20"></uni-icons>
						<image class="w-5 h-5" @click="uncollect(dict)" v-if="dict.is_collected" src="@/static/collected.png" mode=""></image>
						<image class="w-5 h-5" @click="collect(dict)" v-else src="@/static/collect.png" mode=""></image>
					</view>
					<view class="flex gap-4">
						<view class="flex gap-1" v-if="dict.symbols.ph_en">
							<text>英 /{{dict.symbols.ph_en}}/</text>
						</view>
						<view class="flex gap-1" v-if="dict.symbols.ph_am">
							<text>美 /{{dict.symbols.ph_am}}/</text>
						</view>
					</view>
					<view class="flex flex-col gap-2">
						<view class="flex gap-2" v-for="(part, part_index) in dict.symbols.parts" :key="part_index">
							<text class="text-gray-400">{{part.part}}</text>
							<view>
								<text v-for="(mean, mean_index) in part.means" :key="mean_index">{{mean}}；</text>
							</view>
						</view>
					</view>
					<view class="flex flex-wrap">
						<view class="mr-2 mb-1" v-for="(exchanges, format) in dict.exchange" :key="format">{{format}}：<text class="mr-1" :key="ex_index" v-for="(ex, ex_index) in exchanges">{{ex}}</text></view>
					</view>
					<view class="flex gap-2 text-gray-400">
						<view class="bg-gray-100 p-1" :key="tag" v-for="tag in dict.tags">{{tag}}</view>
					</view>
					<view class="border-b py-2 border-gray-100"></view>
					<view class="text-xl">例句</view>
					<view class="flex flex-col gap-2">
						<view class="flex gap-2 justify-between" :key="example_index" v-for="(example, example_index) in dict.examples">
							<view class="flex gap-2">
								<text>{{example_index + 1}}.</text>
								<view class="flex flex-col gap-1">
									<rich-text :nodes="example.en"></rich-text>
									<text>{{example.cn}}</text>
									<text class="text-gray-400">{{example.source}}</text>
								</view>
							</view>
							<view class="">
								<uni-icons @click="play(example)" :class="{playing: example.playing}"
									custom-prefix="iconfont" type="icon-laba" size="20"></uni-icons>
							</view>
						</view>
	
	
					</view>
	
				</view>
			</view>
		</view>
	</uni-popup>
</template>

<script>
	export default {
		name: "dictionary",
		props: ['dict'],
		data() {
			return {
				// dict: null,
			}
		},
		onLoad(options) {
		},
		methods: {
			open() {
				this.$refs.popup.open()
			}
		}
	}
</script>

<style>
</style>