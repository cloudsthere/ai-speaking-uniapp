<template>
	<view class="p-4">
		<view class="header">
			选择合适场景，开始今天练习
		</view>
		<view class="content">
			<view class="flex gap-4 text-gray-400">
				<view class="text-gray-800 selected-tag">面试</view>
				<view class="">面试</view>
				<view class="">面试</view>
			</view>
			<navigator :url="'/pages/conversation/show?scene_id=' + scene.id" v-for="scene in scenes" :key="scene.id">
				<view class="scene-card">
					<view class="avatar">
						<image :src="scene.avatar"></image>
					</view>
					<view class="name">
						<view>{{scene.name}}</view>
					</view>
					<view class="brief">
						<view>{{scene.brief}}</view>
					</view>
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
				scenes: [],
				topic_list: [],
			}
		},
		onLoad() {
			var that = this
			utils.request('GET', '/api/scene', {}, (res) => {
				that.topic_list = res.topic_list
			})
		},
		onShareAppMessage(res) {
			return utils.share()
		},
		onShareTimeline(res) {
			return utils.share()
		},
		methods: {

		}
	}
</script>

<style lang="scss">
	.content {
		display: grid;
		padding: 0 10px 0 10px;
		gap: 10px;
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	.header {
		text-align: center;
		margin: 10px 0 10px 0;
	}

	.selected-tag {
		border-bottom-width: 1px;
		border-color: $uni-color-primary;
	}

	.scene-card {
		padding: 20rpx;
		border-radius: $uni-border-radius-lg;
		box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);

		.avatar {
			text-align: center;

			image {
				border-radius: 50%;
				width: 120rpx;
				height: 120rpx;
			}
		}

		.name {
			margin-top: 10px;
			text-align: center;
			font-size: 16px;
		}

		.brief {
			margin-top: 10px;
			color: $uni-text-color-grey;
			font-size: $uni-font-size-sm;
		}
	}
</style>