<template>
	<view class="p-4 flex flex-col gap-5">
		<view class="flex justify-between gap-3" v-for="teacher in teachers" :key="teacher.id"
			@click="choose(teacher.id)">
			<image :src="teacher.avatar_pic" class="rounded-xl flex-none" style="width: 100px;" mode="widthFix"></image>
			<view class="flex flex-col gap-3">
				<view class="flex justify-between">
					<text>{{teacher.name}}</text>
					<uni-icons @tap.stop.prevent="play(teacher)" :class="{playing: teacher.playing}" custom-prefix="iconfont"
						type="icon-laba" size="20"></uni-icons>
				</view>
				<view class="text-sm">{{teacher.greeting}}</view>
			</view>
		</view>
	</view>
</template>

<script>
	import utils from '@/common/utils.js';
	import player from '@/common/player.js';
	

	export default {
		name: "teacherList",
		props: ['words'],
		data() {
			return {
				teachers: []
			}
		},
		mounted() {
			var that = this
			utils.request('GET', '/api/teacher', {}, (res) => {
				// console.log(res)
				that.teachers = res.teachers
			})
		},
		methods: {
			choose(teacher_id) {
				this.$emit('choose', teacher_id)
				return 
				
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