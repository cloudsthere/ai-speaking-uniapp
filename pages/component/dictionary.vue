<template>
	<uni-popup ref="popup" type="bottom" background-color="#fff" @change="change">
		<view class="" style="height: 60vh;">
			<view class="bg-white" style="height:10px;"></view>
			<view class="px-4 pb-4 bg-white overflow-scroll" style="height: calc(60vh - 20px);">
				<view class="relative">
					<view class="flex gap-3 items-center">
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
					</view>
					<view class="p-2 shadow absolute w-full box-border flex flex-col gap-2 z-10 bg-white"
						v-show="suggestions.length > 0">
						<view class="flex gap-3 flex-nowrap overflow-hidden text-ellipsis whitespace-nowrap"
							@click="search(suggestion.entry)" v-for="suggestion in suggestions"
							:key="suggestion.entry">
							<view class="">{{suggestion.entry}}</view>
							<view class="text-gray-400 overflow-hidden text-ellipsis">{{suggestion.explain}}</view>
						</view>
					</view>
	
					<template v-if="dict">
						<view class="flex flex-col gap-2 justify-center items-center mt-4" v-if="dict.no_data">
							<image mode="widthFix" src="@/static/search-no-data.png" style="width: 50%;"></image>
							<view class="text-gray-400">搜索无结果</view>
						</view>
	
						<view class="text-gray-800 text-sm flex flex-col gap-3 mt-4" v-else>
							<view class="font-semibold flex gap-3 items-baseline" v-if="dict.type != 'zh'">
								<text class="text-2xl">{{dict.query}}</text>
								<uni-icons v-if="dict.audio" @click="play(dict)" :class="{playing: dict.playing}"
									custom-prefix="iconfont" type="icon-laba" size="20"></uni-icons>
								<image class="w-5 h-5" @click="uncollect(dict)" v-if="dict.is_collected"
									src="@/static/collected.png" mode=""></image>
								<image class="w-4 h-4" @click="collect(dict)" v-else src="@/static/collect.png"
									mode=""></image>
							</view>
							<view class="flex gap-4" v-if="dict.pronounces">
								<view class="flex gap-1" v-for="p in dict.pronounces" :key="p.accent">
									<text>{{p.accent}}</text>
									<text>{{p.phonetic}}</text>
									<uni-icons @click="play(p)" :class="{playing: p.playing}"
										custom-prefix="iconfont" type="icon-laba" size="20"></uni-icons>
								</view>
							</view>
							<view class="flex flex-col gap-2">
								<view class="flex gap-2" v-for="(explain, explain_index) in dict.explains"
									:key="explain_index">
									<text class="text-gray-400" v-if="explain.pos">{{explain.pos}}</text>
									<view>
										{{explain.trans}}
									</view>
								</view>
							</view>
							<view class="flex flex-col gap-2" v-if="dict.choices">
								<view class="flex gap-2" v-for="(choice, choice_index) in dict.choices"
									:key="choice_index">
									<text class="text-gray-400">{{choice_index + 1}}</text>
									<view class="flex flex-col gap-1">
										<view class="flex gap-2">
											<text class="text-indigo-600"
												@click="search(choice.point)">{{choice.point}}</text>
											<uni-icons @click="play(choice)" :class="{playing: choice.playing}"
												custom-prefix="iconfont" type="icon-laba" size="20"></uni-icons>
										</view>
										<view class="">
											{{choice.trans}}
										</view>
									</view>
								</view>
							</view>
							<view class="flex flex-wrap">
								<view class="mb-1 mr-3 flex gap-2"
									v-for="(exchange, exchange_index) in dict.exchanges" :key="exchange_index">
									<text class="text-gray-400">{{exchange.name}}</text>
									<text class="font-semibold">{{exchange.word}}</text>
								</view>
							</view>
							<view class="flex gap-2 text-gray-400 flex-wrap">
								<view class="bg-gray-100 p-1" :key="exam_type" v-for="exam_type in dict.exam_types">
									{{exam_type}}
								</view>
							</view>
							<template v-if="dict.examples && dict.examples.length > 0">
								<view class="border-b py-2 border-gray-100"></view>
								<view class="text-xl">例句</view>
								<view class="flex flex-col gap-2">
									<view class="flex gap-2 justify-between" :key="example_index"
										v-for="(example, example_index) in dict.examples">
										<view class="flex gap-2">
											<text>{{example_index + 1}}.</text>
											<view class="flex flex-col gap-1">
												<rich-text :nodes="example.sentence_en_html"></rich-text>
												<text>{{example.sentence_zh}}</text>
												<text class="text-gray-400">{{example.source}}</text>
											</view>
										</view>
										<view class="">
											<uni-icons @click="play(example)" :class="{playing: example.playing}"
												custom-prefix="iconfont" type="icon-laba" size="20"></uni-icons>
										</view>
									</view>
	
	
								</view>
							</template>
	
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
	
	var suggest_task = null;
	
	export default {
		name: "dictionary",
		data() {
			return {
				query: '',
				suggestions: [],
				// dict: null,
				dict: null,
				query_stack: [],
			}
		},
		onLoad() {
			this.$refs.popup.open()
		},
		methods: {
			change(e) {
				console.log(e)
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
				
				this.search(this.query_stack[this.query_stack.length - 1], true)
			},
			search(query, back) {
				this.$refs.popup.open()
				// console.log(query)
				if (query.length == 0) {
					return
				}
				
				// 重复查询
				if (query == this.query_stack[this.query_stack.length - 1]) {
					return;
				}
	
				if (!back) {
					// if (this.last_query) {
						this.query_stack.push(query)
					// }
					// this.last_query = query
				} 
	
				// console.log(this.query_stack)
				// console.log(this.last_query)
	
	
				var that = this
				uni.showLoading({
					title: '加载中'
				})
				utils.request('GET', '/api/search', {
					query,
				}, (res) => {
					// console.log(res)
					that.dict = res.dict
					that.suggestions = []
					uni.hideLoading()
					that.query = query
	
				})
			},
			suggest(e) {
				// console.log(e)
				if (e.type != 'input') {
					return;
				}
	
				if (suggest_task) {
					suggest_task.abort();
				}
	
				if (this.query.length == 0) {
					this.suggestions = []
					return;
				}
	
				var that = this
				suggest_task = wx.request({
					url: utils.domain + '/api/suggest',
					method: 'GET',
					data: {
						query: this.query,
					},
					header: {
						Accept: 'application/json',
						Version: utils.version,
						Platform: utils.platform,
						Authorization: 'Bearer ' + utils.getToken(),
					},
					success(res) {
						suggest_task = null;
						// console.log(res)
						that.suggestions = res.data.suggestions
					}
				})
			},
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
					this.$emit('cancelCollect')
				})
			},
		}
	}
</script>

<style>
</style>