<template>
	<view class="header">
		选择合适场景，开始今天练习
	</view>
	<view class="content">
		<navigator :url="'/pages/conversation/show?scene_id=' + scene.id"  v-for="scene in scenes" :key="scene.id">
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
</template>

<script>
	import utils from '@/utils.js';
	export default {
		data() {
			return {
				scenes: [],
			}
		},
		onLoad() {
			var that = this
			utils.request('GET', '/api/scene', {}, (res) => {
				that.scenes = res.scenes
			})
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