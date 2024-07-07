<template>
	<view class="px-4 mt-4">
		<tui-button @click="submit"  class="flex gap-1" size="26" height="70rpx">
			<uni-icons type="mic" color="white"></uni-icons>
			<text>录制</text>
		</tui-button>
	</view>
</template>

<script>
	import tuiButton from "@/components/thorui/tui-button/tui-button.vue"

	export default {
		components: {
			tuiButton,
		},
		data() {
			return {
				
			}
		},
		methods: {
			
		}
	}
</script>

<style>

</style>
