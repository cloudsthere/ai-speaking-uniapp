<template>
	<view class="w-full progress-box br-6">
		<view class="hp100 bg-green br-6" :style="{width: (percent || 0) + '%'}"></view>
	</view>
</template>

<script>
	export default {
		props: ['percent'],
	}
</script>

<style scoped>
.progress-box {
	height: 12rpx;
	background-color: #F1F3F5;
}

.bg-green {
	background-color: #1CD1AD;
}

.br-6 {
	border-radius: 6rpx;
}
</style>
