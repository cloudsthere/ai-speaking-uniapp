<template>
	<tui-navigation-bar v-bind="$attrs" :isOpacity="false" :title="title" color="#000"></tui-navigation-bar>
	<view :style="{ paddingTop: height + 'px' }">
		<slot></slot>
	</view>
</template>

<script>
import tuiNavigationBar from "@/components/thorui/tui-navigation-bar/tui-navigation-bar.vue"

export default {
	name: 'navContainer',
	components: {
		tuiNavigationBar
	},
	props: {
		title: String
	},
	options: {
		styleIsolation: 'shared',
	},
	data() {
		return {
			height: getApp().globalData.height
		}
	},
}
</script>

<style scoped>
>>> .tui-navigation-bar {
		overflow: hidden;
	}
>>> .tui-navigation-bar .tui-navigation_bar-title {
		font-size: 32rpx;
		font-family: PingFang SC, PingFang SC;
		font-weight: 600;
	}
</style>