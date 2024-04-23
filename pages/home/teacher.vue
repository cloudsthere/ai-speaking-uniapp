<template>
	<teacherList :defaultId="id" ref="teacherList" @choose="choose"></teacherList>
</template>

<script>
	import utils from '@/common/utils.js';
	import teacherList from '../component/teacherList.vue';
	import player from '@/common/player.js';

	export default {
		components: {
			teacherList
		},
		data() {
			return {
				id: ''
			}
		},
		onLoad(option) {
			if(option.id) {
				this.id = option.id
			}
		},
		onUnload() {
			player.stop()
		},
		methods: {
			choose(teacher_id) {
				utils.request('POST', '/api/teacher', {
					id: teacher_id
				}, (res) => {
					uni.showToast({
						title: '设置成功',
						success() {
							setTimeout(() => {
								uni.navigateBack()
							}, 1000)
						}
					})
				})
			},
			play(cd) {
				// e.stopPropagation()
				player.play(cd)
			}
		}
	}
</script>

<style>
</style>