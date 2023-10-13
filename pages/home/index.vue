<template>
	<view class="p-4">
		<view class="header">
			选择合适场景，开始今天练习
		</view>
		<view class="content">
			<navigator :url="'/pages/conversation/detail?topic_en=' + topic.enName + '&topic=' + topic.name + '&emoji=' + topic.emoji" v-for="(topic, topic_index) in topics"
				:key="topic_index">
				<view class="scene-card text-center">
					<view class="avatar text-3xl">
						{{topic.emoji}}
					</view>
					<view class="name text-xl">
						<view>{{topic.name}}</view>
					</view>
					<view class="brief text-sm">
						<view>{{topic.enName}}</view>
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
				// scenes: [],
				topics: [],
			}
		},
		onLoad() {
			var that = this
			utils.request('GET', '/api/scene', {}, (res) => {
				that.topics = res.topics
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
	// .content {
	// 	display: grid;
	// 	padding: 0 10px 0 10px;
	// 	gap: 10px;
	// 	grid-template-columns: repeat(2, 1fr);
	// 	grid-template-rows: repeat(2, 1fr);
	// }
	.content {
		display: flex;
		align-items: stretch;
		flex-wrap: wrap;

		navigator {
			flex-basis: calc(50% - 10px);
			/* 50%宽度减去间距 */
			margin: 5px;
			/* 间距 */
		}
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
			height: 32px;
			color: $uni-text-color-grey;
			font-size: $uni-font-size-sm;
		}
	}
</style>