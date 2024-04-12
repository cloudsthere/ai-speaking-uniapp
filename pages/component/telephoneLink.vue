<template>
	<view class="fixed top-0 left-0 w-full hp100 bg-white">
		<view class="w-full hp100 bg-page flex flex-col items-center justify-between">
			<view class="avatar relative">
				<image class="w-full hp100 rounded-half" :src="avatar" />
				<view v-if="status === 'thinking' || modelValue === 'speaking'" class="absolute mind">
					<image v-if="status === 'thinking'" src="/static/thinking.png" />
					<image v-if="status !== 'thinking' && modelValue === 'speaking'" src="/static/listening.png" />
				</view>
			</view>
			<view class="flex flex-col justify-end items-center flex-auto status-box">
				<view class="flex flex-col justify-between items-center gap-24">
					<image v-if="modelValue === 'listening'" class="w-128" src="/static/listening.png" />
					<text class="fs-28 c-blue-1 ">{{getStatusText(status, modelValue)}}</text>
				</view>
				<image @tap="hangUp" class="w-128" src="/static/icon-hangup.svg" />
			</view>
		</view>
	</view>
</template>

<script>
export default {
	props: ['modelValue', 'avatar', 'status'],
	methods: {
		getStatusText(status, phoneStaus) {
			if(status === 'thinking') return '思考中...'
			const map = {
				'listening': '正在听...',
				'speaking': '回答中...'
			}
			return map[phoneStaus]
		},
		hangUp() {
			this.$emit('hangUp')
		}
	}
}
</script>

<style scoped>
.bg-page {
	background-image: url(/static/chat-bg.jpg);
	background-repeat: no-repeat;
	align-content: baseline;
}

.avatar {
	margin-top: 176rpx;
	width: 384rpx;
	height: 384rpx;
}

.w-128 {
	width: 128rpx;
	height: 128rpx;
}
.mt-128 {
	margin-top: 128rpx;
}
.status-box {
	gap: 128rpx;
	margin-bottom: 128rpx;
}
.mind {
	top: -32rpx;
	right: -56rpx;
	display: flex;
	align-items: center;
	background-color: #fff;
	width: 192rpx;
	height: 128rpx;
	justify-content: center;
	box-shadow: 0rpx 0rpx 60rpx 0rpx rgba(241,241,241,0.6), 0rpx 4rpx 8rpx 0rpx rgba(241,241,241,0.3);
}
.mind image {
	width: 96rpx;
	height: 96rpx;
}
</style>