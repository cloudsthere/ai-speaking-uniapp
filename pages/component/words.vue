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
		props: ['text'],
		data() {
			return {
				// dict: null,
				words: []
			}
		},
		watch: {
			text: {
				handler(newValue, oldValue) {
					let parts = newValue.split(/([\.!\?, ])/);

					// 过滤掉空字符串
					this.words = parts.filter(part => part !== '');
				},
				immediate: true
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