<template>
	<view class="bg-white flex flex-col gap-1 items-center setting text-gray-600 text-sm" v-if="conv">
		<image ref="avatar" class="rounded-lg avatar mt-8 mb-4" :src="conv.agent.avatar"></image>
		<view class="c-blue-1 name mb-2">
			{{conv.agent.name}}
		</view>
		<view class="flex gap-1 items-center">
			<uni-icons type="chatboxes-filled"></uni-icons>
			<text>{{conv.agent.chat}}个互动</text>
		</view>
		<view class="text-sky-500">
			由 @{{conv.agent.created_by == 'system' ? 'MateAI' : conv.agent.creator.name}} 创建
		</view>
		<view class="flex justify-center gap-3">
			<view class="flex items-center gap-1" @click="like">
				<uni-icons :type="conv.like ? 'hand-up-filled' : 'hand-up'"></uni-icons>
				<text v-if="conv.agent.like">{{conv.agent.like}}</text>
			</view>
			<view class="bg-gray-600" style="width: 1rpx;"></view>
			<uni-icons :type="conv.unlike ? 'hand-down-filled' : 'hand-down'" @click="unlike"></uni-icons>
		</view>
		<view class="px-4 mt-1">{{conv.agent.subtitle}}</view>
		<view class="mt-64 w-full">

			<view @tap="clear" class="cell flex items-center justify-between w-full box-border">
				<view class="flex items-center gap-16">
					<image class="w-32" src="/static/icon-clean.svg" />
					<text class="c-blue-1 font-semibold fs-28">清除上下文</text>
				</view>
				<view class="flex items-center gap-16">
					<image class="w-32" src="/static/icon-rightarrow.svg" />
				</view>
			</view>
			<view class="cell flex items-center justify-between w-full box-border">
				<view class="flex items-center gap-16">
					<uni-icons type="chat" color="#1f1f1f"></uni-icons>
					<text class="c-blue-1 font-semibold fs-28">开启自动助答</text>
				</view>
				<view class="flex items-center gap-16">
					<view class="" @click.stop.prevent="switchRecommend" >
						<switch :disabled="true" :checked="auto_recommend" style="transform:scale(0.7)" />
					</view>
				</view>
			</view>
			<navigator v-if="conv.agent.user_id == user.id" :url="'/pages/agent/create?agent_id=' + conv.agent.id"
				class="cell flex items-center justify-between w-full box-border">
				<view class="flex items-center gap-16">
					<uni-icons type="compose" color="#1f1f1f"></uni-icons>
					<text class="c-blue-1 font-semibold fs-28">编辑角色</text>
				</view>
				<view class="flex items-center gap-16">
					<image class="w-32" src="/static/icon-rightarrow.svg" />
				</view>
			</navigator>
		</view>
	</view>
</template>

<script>
	import utils from '@/common/utils.js';

	export default {
		data() {
			return {
				conv: null,
				conv_id: null,
				user: utils.getUser(),
				auto_recommend: !utils.getUser() || (utils.getUser().hasOwnProperty('auto_recommend') && utils.getUser().auto_recommend)
			}
		},
		onLoad(options) {
			this.conv_id = options.conv_id
			// console.log('user', this.user)
		},
		onShow(options) {
			// console.log(options)
			// 刷新user
			this.user = utils.getUser()
			var that = this
			utils.request('get', '/api/conversation/' + this.conv_id + '/setting', {}, (res) => {
				// console.log(res)
				that.conv = res.conversation
			})
		},
		onShareAppMessage(res) {
			return utils.shareAgent(this.conv.agent)
		},
		onShareTimeline(res) {
			return utils.shareAgent(this.conv.agent)
		},
		methods: {
			clear() {
				utils.request('post', '/api/message/delete', {
					conv_id: this.conv.id
				}, (res) => {
					// console.log(res)
					if (res.error == 0) {
						uni.showToast({
							title: '删除成功',
						})
					}
				})
			},
			switchRecommend() {
				// console.log(res)
				if (!utils.getUser()) {
					utils.loginFirst()
					return;
				}
				var that = this
				utils.request('post', `/api/user/auto-recommend`, {
					auto_recommend: !this.auto_recommend
				}, (response) => {
					// console.log(res)
					that.user.auto_recommend = response.auto_recommend
					utils.setUser(that.user)
					that.auto_recommend = response.auto_recommend
				})
			},
			like() {
				var that = this
				if (!utils.getUser()) {
					utils.loginFirst()
					return;
				}
				utils.request('post', `/api/conversation/${this.conv.id}/like`, {}, (res) => {
					// console.log(res)
					that.conv.like = res.like
					that.conv.agent.like = res.count
				})
			},
			unlike() {
				var that = this
				if (!utils.getUser()) {
					utils.loginFirst()
					return;
				}
				utils.request('post', `/api/conversation/${this.conv.id}/unlike`, {}, (res) => {
					// console.log(res)
					that.conv.unlike = res.unlike
					that.conv.agent.unlike = res.count
				})
			}
		}
	}
</script>

<style scoped>
	.avatar {
		width: 208rpx;
		height: 208rpx;
		/* margin-top: 64rpx; */
		/* margin-bottom: 32rpx; */
	}

	.name {
		font-size: 48rpx;
		/* margin-bottom: 16rpx; */
		font-weight: 600;
	}

	.mt-64 {
		margin-top: 64rpx;
	}

	.cell {
		/* height: 100rpx; */
		padding: 34rpx 40rpx;
	}

	button::after {
		border: 0 !important;
	}
</style>