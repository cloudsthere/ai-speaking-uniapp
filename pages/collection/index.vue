<template>
	<navContainer title="单词本" backgroundColor="#f3f4f6">
		<view class="content relative" :style="{paddingBottom: isEdit?'104rpx': '0'}">
			<view class="flex justify-between">
				<view class="fs-26 pl-8">共{{ count }}词</view>
				<view class="flex justify-between items-center text-sm relative">
					<image v-if="isShowDefinition" class="p-h-32 sort-icon" src="/static/icon-eye.svg" @tap="toggleDefinition(false)" />
					<image v-else class="p-h-32 sort-icon" src="/static/icon-eye-closed.svg" @tap="toggleDefinition(true)" />
					<image class="sort-icon" src="/static/icon-first-order-time.svg" @tap="toggleSortPopup(true)" />
					<view class="divide"></view>
					<view style="height: 40rpx;width: 40rpx">
						<image v-if="isEdit" @tap="changeMode" class="sort-icon" src="/static/icon-batchmanage-selected.svg" />
						<image v-else @tap="changeMode" class="sort-icon" src="/static/icon-batchmanage-normal.svg" />
						<tui-bubble-popup :show="isShowSortPopup" @close="toggleSortPopup(false)" backgroundColor="#fff" position="absolute" direction="null" radius="24rpx" width="220rpx"
						right="0" top="45rpx">
							<view class="w-full c-blue-2 fs-24 br-24 popup-box">
								<view v-for="(item, i) in sortData" class="sort-item flex items-center" @tap="() => changeSort(item, i)">
									<image v-if="item.isActive" class="sort-icon" :src="item.activeIcon" />
									<image v-else class="sort-icon" :src="item.icon" />
									<text class="ml-12">{{ item.text }}</text>
								</view>
							</view>
						</tui-bubble-popup>
					</view>
				</view>
			</view>

			<view v-if="is_login">
				<view v-if="collections.length > 0" :key="chunk.key" v-for="chunk in listData">
					<view class="pl-8 pt-32 pb-8 fs-24 c-gray-1">{{chunk.key}}</view>
					<view @click="lookup(c.query)" v-for="c in chunk.items" :key="c.id" class="bg-white flex br-24 items-center word-card mb-16">
						<image v-if="isEdit && c.selected" @tap.stop="selectItem(c, false)" class="w-32 no-shrink" src="/static/checkbox-selected.svg" />
						<image v-else-if="isEdit && !c.selected" @tap.stop="selectItem(c, true)" class="w-32 no-shrink" src="/static/checkbox.svg" />
						<image v-else-if="c.isPlaying" @tap.stop="stop(c)" class="w-32 no-shrink" src="/static/icon-voice-selected.svg" />
						<image v-else @tap.stop="play(c)" class="w-32 no-shrink" src="/static/icon-voice-grey.svg" />
						<view class="flex flex-col gap-1 p-h-32" style="min-width:0;flex-shrink:1;">
							<text class="c-blue-1 fs-36 font-semibold">{{c.query}}</text>
							<text v-if="isShowDefinition" class="fs-22 text-gray-400 overflow-hidden whitespace-nowrap text-ellipsis">{{c.brief}}</text>
						</view>
					</view>
				</view>
				<view v-else class="flex c-gray-1 fs-24 unlogin flex-col items-center justify-center">
					<image class="unlogin-icon" src="/static/img-default-notloggedin.svg" />
					<view>还没有收藏的单词哦</view>
				</view>
			</view>
			<view v-else class="flex c-gray-1 fs-24 unlogin flex-col items-center justify-center">
				<image class="unlogin-icon" src="/static/img-default-notloggedin.svg" />
				<view>先登录一下吧，<text class="goLogin" @tap="goLogin">去登录</text></view>
			</view>
			
			<view v-if="isEdit" class="fixed w-full bottom-0 left-0 bottom-action flex">
				<view class="all-check bg-white flex items-center justify-center">
					<image v-if="isAllChecked" @tap="checkAll(false)" class="w-32 no-shrink bg-white" src="/static/checkbox-selected.svg" />
					<image v-else @tap="checkAll(true)" class="w-32 no-shrink bg-white" src="/static/checkbox.svg" />
					<text class="fs-32 c-blue-1 ml-16">全选</text>
				</view>
				<view @tap.stop="cancelCollect" class="c-white cancel-collect">取消收藏</view>
			</view>
		</view>
	</navContainer>
	<dictionary ref="dictionary" @cancelCollect="getData"></dictionary>
</template>

<script>
	import utils from '@/common/utils.js';
	import player from '@/common/player.js';
	import dictionary from '../component/dictionary.vue';
	import navContainer from '../component/navContainer.vue'
	import tuiBubblePopup from '@/components/thorui/tui-bubble-popup/tui-bubble-popup.vue'

	export default {
		components: {
			dictionary,
			navContainer,
			tuiBubblePopup
		},
		data() {
			return {
				collections: Object.freeze([]),
				listData: [],
				count: 0,
				is_login: true,
				isShowDefinition: false,
				
				isEdit: false,
				isAllChecked: false,
				
				isShowSortPopup: false,
				sortData: [
					{
						key: 'letter-sort',
						icon: '/static/icon-first-order-letter.svg',
						activeIcon: '/static/icon-first-order-letter-selected.svg',
						text: '字母正序',
						isActive: false
					},
					{
						key: 'letter-sort-inverse',
						icon: '/static/icon-inverse-order-letter.svg',
						activeIcon: '/static/icon-inverse-order-letter-selected.svg',
						text: '字母倒序',
						isActive: false
					},
					{
						key: 'time-sort',
						icon: '/static/icon-first-order-time.svg',
						activeIcon: '/static/icon-first-order-time-selected.svg',
						text: '时间正序',
						isActive: true
					},
					{
						key: 'time-sort-inverse',
						icon: '/static/icon-inverse-order-time.svg',
						activeIcon: '/static/icon-inverse-order-time-selected.svg',
						text: '时间倒序',
						isActive: false
					},
				],
			}
		},
		onShow() {
			this.isShowDefinition = false
			this.isShowSortPopup = false
			this.isAllChecked = false
			this.isEdit = false
			this.getData()
		},
		methods: {
			getData() {
				utils.request('GET', '/api/collection', {}, (res) => {
					if (res.error == 101) {
						this.is_login = false
					} else {
						this.collections = res.collections
						this.count = res.collections.length
						const item = this.sortData.find(val => val.isActive)
						this.sortAction(item.key)
					}
				})
			},
			changeMode() {
				this.isEdit = !this.isEdit
			},
			play(item) {
				item.isPlaying = true
				// innerAudioContext.go(cd)
				player.sound(item.pronounce, () => {
					item.isPlaying = false
				})
			},
			stop(item) {
				item.isPlaying = false
				player.stop()
			},
			lookup(word) {
				// console.log(word)
				// return;
				this.$refs.dictionary.search(word)
			},
			selectItem(item, bool) {
				item.selected = bool
			},
			
			goLogin() {
				uni.navigateTo({
					url: '/pages/auth/login'
				})
			},
			
			toggleDefinition(bool) {
				this.isShowDefinition = bool
			},
			
			toggleSortPopup(bool) {
				this.isShowSortPopup = bool
			},
			
			changeSort(item, i) {
				this.sortData.forEach(val => {
					val.isActive = false
				})
				item.isActive = true
				this.isShowSortPopup = false
				this.sortAction(item.key)
			},
			sortAction(key) {
				switch(key) {
					case 'letter-sort': return this.listData = this.splitByLetter(true)
					case 'letter-sort-inverse': return this.listData = this.splitByLetter(false)
					case 'time-sort': return this.listData = this.splitByDate(true)
					case 'time-sort-inverse': return this.listData = this.splitByDate(false)
				}
			},
			splitByDate(isAscending) {
				const arr = this.collections.slice(0)
				arr.sort((a,b) => {
					return (isAscending && a.created_at < b.created_at) ? 1 : -1
				})
				
				return utils.chunk(arr, 'created_at', (dateStr) => {
					if(!dateStr) return
					const formatDate = dateStr.split(' ')[0]
					const date = new Date(formatDate)
					var yesterday = new Date();
					yesterday.setDate(yesterday.getDate() - 1);
					
					if(utils.isEqualDate(date, new Date())) {
						return '今天'
					} else if(utils.isEqualDate(date, yesterday)) {
						return '昨天'
					} else {
						return formatDate
					}
					
				})
			},
			splitByLetter(isAscending) {
				const arr = this.collections.slice(0)
				arr.sort((a,b) => {
					return (isAscending && a.query > b.query) ? 1 : -1
				})
				
				return utils.chunk(arr, 'query', (query) => {
					return query[0].toUpperCase()
				})
			},
			
			checkAll(bool) {
				this.isAllChecked = bool
				this.collections.forEach(val => {
					val.selected = bool
				})
			},
			
			cancelCollect() {
				const ids = this.collections.filter(val => val.selected).map(val => val.dict_id)
				if(ids.length > 0) {
					utils.request('post', '/api/collection/delete', {
						dict_ids: ids
					}, ()=> {
						this.getData()
					})
				}
				
			}
		}
	}
</script>

<style lang="scss">
	page {
		background-color: $app-bg-gray;
	}
	
	.content {
		padding: 18rpx 32rpx;
	}
	
	.sort-icon {
		width: 40rpx;
		height: 40rpx;
	}
	
	.divide {
		border: 2rpx solid #E9E9E9;
		height: 25rpx;
		margin: 0 24rpx;
	}
	
	.sort-item {
		height: 40rpx;
		margin-bottom: 40rpx;
	}
	
	.popup-box {
		box-sizing: border-box;
		padding: 40rpx 32rpx 0;
	}
	
	.unlogin {
		width: 100%;
		margin-top: 186rpx;
	}
	
	.unlogin-icon {
		width: 190rpx;
		height: 190rpx;
		margin-bottom: 16rpx;
	}
	
	.goLogin {
		color: #1CD1AD;
	}
	
	.word-card {
		padding-left: 32rpx;
		height: 130rpx;
	}
	
	.bottom-action {
		height: 104rpx;
	}
	
	.all-check {
		width: 240rpx;
		height: 100%;
	}
	
	.cancel-collect {
		flex-grow: 1;
		height: 100%;
		text-align: center;
		background: #1CD1AD;
		line-height: 104rpx;
	}
</style>