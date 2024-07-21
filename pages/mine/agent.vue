<template>
	<view class="px-4 py-4">
		<navigator url="/pages/agent/create"
			class="flex gap-1 justify-center items-center fs-30 font-medium  rounded-xl py-2 bg-primary mb-2">
			<uni-icons type="plus"></uni-icons>
			<text>创建角色</text>
		</navigator>
		<view @click="toConversation(agent)" v-for="agent in agents" :key="agent.id" class="bg-primary rounded-xl">
			<tui-list-cell unlined :arrow="false" padding="24rpx 32rpx"
				:backgroundColor="(agent.is_primary || agent.sort > 0) ? '#FAFAFA' : '#fff'">
				<view class="flex justify-between items-stretch w-full gap-3 py-2 px-2 box-border mb-2">
					<view class="flex overflow-hidden w-full items-center">
						<img class="avatar br-24 flex-fixed" :src="agent.avatar" />
						<view class="cell-title overflow-hidden flex gap-1 flex-col">
							<view class="font-semibold fs-32">{{agent.name}}</view>
							<view class="cell-brief c-gray-1 text-ellipsis fs-26 overflow-hidden whitespace-nowrap">
								{{agent.subtitle}}
							</view>
							<view class="flex gap-3 fs-20 c-gray-3">
								<view class="flex gap-1 items-center" v-if="agent.chat">
									<uni-icons type="chatboxes-filled" size="12"></uni-icons>
									<text>{{agent.chat}}</text>
								</view>
								<view class="flex gap-1 items-center" v-if="agent.like">
									<uni-icons type="hand-up-filled" size="12"></uni-icons>
									<text>{{agent.like}}</text>
								</view>
							</view>
						</view>
					</view>
					<view @click.stop.prevent="toEdit(agent)"
						class="flex justify-center items-center px-2">
						<uni-icons type="gear" size="30"></uni-icons>
					</view>
				</view>
			</tui-list-cell>
		</view>
	</view>
</template>

<script>
	import utils from '@/common/utils.js';
	export default {
		data() {
			return {
				agents: [],
			}
		},
		onShow() {
			utils.authGuard()
		},
		onLoad() {
			var that = this
			utils.request('GET', '/api/agent/user', {}, (res) => {
				that.agents = res.agents
			})
		},
		methods: {
			toConversation(agent) {
				uni.navigateTo({
					url: '/pages/conversation/show?agent_id=' + agent.id
				})
			},
			toEdit(agent) {
				uni.navigateTo({
					url : `/pages/agent/create?agent_id=${agent.id}`
				})
			}
		}
	}
</script>

<style>
	.avatar {
		width: 100rpx;
		height: 100rpx;
		margin-right: 24rpx
	}

	.tui-list-item {
		padding: 40rpx 30rpx;
		display: flex;
		align-items: center;
		box-sizing: border-box;
	}
</style>