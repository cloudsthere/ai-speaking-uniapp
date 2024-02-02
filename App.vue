<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
			uni.getSystemInfo({
				success: (e) => {
					let custom = uni.getMenuButtonBoundingClientRect();
					this.globalData.height = custom.height + custom.top  * 2 - e.statusBarHeight + 4;
				}
			})
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		},
		globalData: {
			userInfo: {},
			height: 0
		}
	}
</script>

<style lang="scss">
	@import "@/static/iconfont.css";
	@import "@/dist/tailwind.css";
	@import "@/app.scss";
	/*每个页面公共css */
</style>