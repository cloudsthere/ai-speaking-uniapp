<template>
	<uni-popup ref="popup" type="bottom" @change="change">
		<view class="bg-white" style="border-radius: 20rpx 20rpx 0 0;">
			<view class="hp100 relative" :style="suggestions.length === 0 && 'overflow-y: auto;'">
				<view class="popup-box">
					<view class="w-full flex items-center justify-between" style="gap: 28rpx">
						<uni-search-bar ref="search" class="flex-grow br-16" :class="!!query ? 'input' : 'placeholder'" bgColor="#FAFAFA" :focus="true" cancelButton="none" placeholder="查询中文或英文" @confirm="search(query.trim())" @input="suggest">
							<template v-slot:searchIcon>
								<uni-icons v-if="query_stack.length > 1" @click="back" color="#353E50" class="w-32" type="arrow-left" />
								<uni-icons v-else class="w-32" type="search" />
							</template>
						</uni-search-bar>
						<uni-icons type="closeempty" @click="close" size="24"></uni-icons>
					</view>
					
					<!-- <view class="flex gap-3 items-center">
						<image class="w-5 h-5" src="@/static/back.png" @click="back"
							v-show="query_stack.length > 1"></image>
						<view class="relative flex-auto">
							<input name="query" v-model="query" @confirm="search(query.trim())" @input="suggest"
								placeholder="支持中英文"
								class="pr-10 py-2 border-b border-x-0 border-t-0 text-left border-gray-200 border-solid" />
							<view
								class="absolute right-0 top-0 bottom-0 flex flex-col gap-2 items-center justify-center py-1 items-stretch">
								<image class="w-5 h-5" src="@/static/search.png" @click="search(query.trim())">
								</image>
							</view>
						</view>
					</view> -->
					<view class="shadow absolute flex flex-col z-10 bg-white suggestion-box"
						v-show="suggestions.length > 0">
						<view class="flex flex-nowrap w-full overflow-hidden text-ellipsis whitespace-nowrap items-center suggestion-item"
							@click="search(suggestion.entry)" v-for="suggestion in suggestions"
							:key="suggestion.entry">
							<view class="c-blue-1 fs-32 font-semibold">{{suggestion.entry}}</view>
							<view class="ml-24 c-gray-1 fs-26 overflow-hidden text-ellipsis">{{suggestion.explain}}</view>
						</view>
					</view>
	
					<template v-if="dict">
						<view class="flex flex-col gap-2 justify-center items-center mt-32" v-if="dict.no_data">
							<image mode="widthFix" src="@/static/search-no-data.png" style="width: 50%;"></image>
							<view class="text-gray-400">搜索无结果</view>
						</view>
	
						<view class="flex flex-col mt-32" v-else>
							<view class="font-semibold flex justify-between items-baseline" v-if="dict.type != 'zh'">
								<view class="flex items-center">
									<text class="c-blue-1 word">{{dict.query}}</text>
									<image v-if="dict.audio" @click="play(dict)" class="w-32" src="/static/icon-voice-green-m.svg" />
									<!-- <uni-icons   :class="{playing: dict.playing}"
										custom-prefix="iconfont" type="icon-laba" size="20"></uni-icons> -->
								</view>
								<image class="w-48" @click="uncollect(dict)" v-if="dict.is_collected"
									src="/static/icon-collect-selected.svg" />
								<image class="w-48" @click="collect(dict)" v-else src="/static/icon-collect-normal.svg" />
							</view>
							<view class="flex gap-24 mt-24" v-if="dict.pronounces">
								<view class="flex pronounce items-center" v-for="p in dict.pronounces" :key="p.accent">
									<text class="c-blue-1 fs-24">{{p.accent}}</text>
									<text class="c-gray-1 fs-24">{{p.phonetic.replaceAll(' ', '')}}</text>
									<image @click="play(p)" class="w-32" src="/static/icon-voice-green-m.svg" />
									<!-- <uni-icons @click="play(p)" :class="{playing: p.playing}"
										custom-prefix="iconfont" type="icon-laba" size="20"></uni-icons> -->
								</view>
							</view>
							<view class="flex flex-col gap-24 mt-32">
								<view class="flex no-grow" v-for="(explain, explain_index) in dict.explains"
									:key="explain_index">
									<text class="c-gray-1 fs-24 mr-20" v-if="explain.pos">{{explain.pos}}</text>
									<view class="c-blue-1 fs-26 font-semibold">
										{{explain.trans}}
									</view>
								</view>
							</view>
							<view class="flex flex-col absolute choice-box" v-if="dict.choices && dict.choices.length > 0">
								<view class="flex" v-for="(choice, choice_index) in dict.choices"
									:key="choice_index">
									<view class="w-full choice-item">
										<view class="flex gap-24 items-center">
											<text class="c-blue-1 fs-32 font-semibold"
												@click="search(choice.point)">{{choice.point}}</text>
											<image v-if="choice.playing" @click="play(choice)" class="w-32" src="/static/icon-voice-selected.svg" />
											<image v-else @click="play(choice)" class="w-32" src="/static/icon-voice-grey.svg" />
											<!-- <uni-icons @click="play(choice)" :class="{playing: choice.playing}"
												custom-prefix="iconfont" type="icon-laba" size="20"></uni-icons> -->
										</view>
										<view class="mt-12 fs-26 c-gray-1">
											{{choice.trans}}
										</view>
									</view>
								</view>
							</view>
							<view v-if="dict.exchanges" class="flex flex-wrap exchange">
								<view class="flex gap-12"
									v-for="(exchange, exchange_index) in dict.exchanges" :key="exchange_index">
									<text class="fs-24 c-gray-1">{{exchange.name}}</text>
									<text class="fs-26 c-blue-1 font-medium">{{exchange.word}}</text>
								</view>
							</view>
							<view class="flex gap-12 c-gray-1 flex-wrap" style="margin-top: 40rpx;">
								<view class="bg-gray-2 fs-22 tag" :key="exam_type" v-for="exam_type in dict.exam_types">
									{{exam_type}}
								</view>
							</view>
							<view class="c-blue-1 example-box" v-if="dict.examples && dict.examples.length > 0">
								<view class="fs-26">例句</view>
								<view class="flex flex-col mt-24">
									<view class="flex justify-between" style="margin-bottom: 36rpx;" :key="example_index"
										v-for="(example, example_index) in dict.examples">
										<view class="flex flex-col gap-16">
											<rich-text class="rich-text" :nodes="example.sentence_en_html"></rich-text>
											<text class="fs-24 c-gray-1">{{example.sentence_zh}}</text>
											<text class="fs-20 c-gray-3">一{{example.source}}</text>
										</view>
										<view class="no-shrink" style="margin-left: 32rpx;">
											<image v-if="example.playing" @click="play(example)" class="w-32" src="/static/icon-voice-selected.svg" />
											<image v-else @click="play(example)" class="w-32" src="/static/icon-voice-grey.svg" />
											<!-- <uni-icons @click="play(example)" :class="{playing: example.playing}"
												custom-prefix="iconfont" type="icon-laba" size="20"></uni-icons> -->
										</view>
									</view>
	
	
								</view>
							</view>
	
						</view>
					</template>
				</view>
			</view>
		</view>
	</uni-popup>
</template>

<script>
	import utils from '@/common/utils.js';
	import player from '@/common/player.js';
	
	export default {
		name: "dictionary",
		data() {
			return {
				query: '',
				suggestions: [],
				dict: null,
				query_stack: [],
				
				doNotSuggest: Object.freeze(false)
			}
		},
		onLoad() {
			this.$refs.popup.open()
		},
		options: {
			styleIsolation: 'shared'
		},
		methods: {
			change(e) {
				if(!e.show) {
					this.$emit('close')
				}
			},
			close() {
				this.$refs.popup.close()
			},
			showSearch() {
				this.dict = null;
				this.query = ''
				this.suggestions = []
				this.query_stack = []
				this.$refs.popup.open()
			},
			back() {
				let query = this.query_stack.pop()
				this.dict = null;
				this.search(this.query_stack[this.query_stack.length - 1], true)
			},
			search(query, back) {
				this.$refs.popup.open()
				// console.log(query)
				if (query.length == 0) {
					return
				}
				
				// 重复查询
				// if (query == this.query_stack[this.query_stack.length - 1]) {
				// 	return;
				// }
	
				if (!back) {
					this.query_stack.push(query)
				} 
				
				uni.showLoading({
					title: '加载中'
				})
				utils.request('GET', '/api/search', {
					query,
				}, (res) => {
					// console.log(res)
					this.dict = res.dict
					this.suggestions = []
					uni.hideLoading()
					this.doNotSuggest = true
					this.$refs.search.searchVal = query
				})
			},
			suggest: utils.debounce(function(keyword) {
				this.query = keyword
				
				if(this.doNotSuggest) {
					return this.doNotSuggest = false
				}
	
				if (keyword.length == 0) {
					this.suggestions = []
					return;
				}
	
				wx.request({
					url: utils.domain + '/api/suggest',
					method: 'GET',
					data: {
						query: keyword,
					},
					header: {
						Accept: 'application/json',
						Version: utils.version,
						Platform: utils.platform,
						Authorization: 'Bearer ' + utils.getToken(),
					},
					success: (res) => {
						this.suggestions = res.data.suggestions
					}
				})
			}),
			play(cd) {
				player.play(cd)
			},
			open() {
				this.$refs.popup.open()
			},
			collect(dict) {
				if (!utils.getUser()) {
					utils.loginFirst()
					return;
				}
				utils.request('POST', '/api/collection', {
					dict_id: dict.id,
					query: dict.query
				}, (res) => {
					dict.is_collected = true
					uni.showToast({
						title: '加入单词本'
					})
				})
			},
			uncollect(dict) {
				if (!utils.getUser()) {
					utils.loginFirst()
					return;
				}
				utils.request('POST', '/api/collection/delete', {
					dict_ids: [dict.id]
				}, (res) => {
					dict.is_collected = false
					uni.showToast({
						title: '从单词本删除'
					})
				})
			},
		}
	}
</script>

<style scoped>
.popup-box {
	height: 60vh; 
	padding: 40rpx 40rpx 0;
	box-sizing: border-box;
}
>>> .uni-searchbar {
	padding: 0;
}
>>> .uni-searchbar__box {
	border: 2rpx solid #F1F3F5;
}
.placeholder >>> .uni-searchbar__box-search-input {
	color: #8C8E9D;
}

.input >>> .uni-searchbar__box-search-input {
	color: #000;
}

.mt-44 {
	margin-top: 44rpx;
}

.word {
	font-size: 48rpx;
	margin-right: 24rpx;
	line-height: 60rpx;
}

.pronounce {
	border-radius: 26rpx;
	border: 2rpx solid #F1F3F5;
	padding: 10rpx 24rpx;
	gap: 10rpx;
	height: 52rpx;
	box-sizing: border-box;
}

.exchange {
	margin-top: 40rpx;
	row-gap: 16rpx;
	column-gap: 40rpx;
}

.tag {
	padding: 8rpx 16rpx;
	border-radius: 8rpx;
}
.example-box {
	margin-top: 48rpx;
}
.rich-text {
	font-size: 26rpx
}
.suggestion-box {
	width: 100vw;
	box-sizing: border-box;
	left: 0;
	height: calc(60vh - 112rpx);
}
.suggestion-item {
	height: 108rpx;
	padding: 0 40rpx;
	box-sizing: border-box;
	border-bottom: 2rpx solid #F1F3F5;
}
.choice-box {
	left: 0;
	width: 100vw;
}
.choice-item {
	padding: 32rpx 40rpx;
	border-bottom: 2rpx solid #F1F3F5;
}
</style>