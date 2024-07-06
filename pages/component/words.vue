<template>
	<view class="">
		
	<template v-for="(word, i) in words" :key="i">
		<text v-if="['.', ',', '?', ' ', '!'].includes(word)">{{appendSpace(word)}}</text>
		<text v-else @click="lookup(word)" class="word">{{word}}</text>
	</template>
	</view>
</template>

<script>
	export default {
		name: "words",
		props: ['words'],
		data() {
			return {
				// dict: null,
			}
		},
		methods: {
			lookup(word) {
				this.$emit('lookup', word)
			},
			appendSpace(word) {
				return word.endsWith(' ') ? word : word + ' '
			}
		}
	}
</script>

<style>
	.word:hover {
		text-decoration-line: underline;
	}
</style>