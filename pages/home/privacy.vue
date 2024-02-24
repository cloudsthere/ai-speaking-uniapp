<template>
	<web-view :src="url"></web-view>
</template>

<script>
	import utils from '@/common/utils.js';
	
	export default {
		data() {
			return {
				url: utils.domain + '/privacy',
			}
		},
	}
</script>

<style>

</style>