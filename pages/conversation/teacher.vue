<template>
	<teacherList ref="teacherList" @choose="choose"></teacherList>
</template>

<script>
	import teacherList from '../component/teacherList.vue';
	import utils from '@/common/utils.js';

	export default {
		components: {
			teacherList,
		},
		data() {
			return {
				conv_id: null
			}
		},
		onLoad(options) {
			console.log(options)
			this.conv_id = options.conv_id
		},
		methods: {
			choose(teacher_id) {
				// console.log('choose', teacher_id)
				utils.request('POST', '/api/conversation/' + this.conv_id + '/teacher', {
					teacher_id: teacher_id
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
			}
		}
	}
</script>

<style>
</style>