<template>
	<teacherList ref="teacherList" @choose="choose"></teacherList>
</template>

<script>
	import utils from '@/common/utils.js';
	import teacherList from '../component/teacherList.vue';
	

	export default {
		components: {
			teacherList
		},
		data() {
			return {
			}
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