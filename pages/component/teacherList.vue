<template>
	<view class="flex flex-col gap-16 page">
		<view class="flex cell br-24 items-center" v-for="teacher in teachers" :key="teacher.id">
			<radio @click="choose(teacher)" :checked="teacher.checked" class="mr-32" color="#38b5b3" style="transform:scale(0.7);"></radio>
			<view class="relative avatar mr-24 no-shrink br-24">
				<image :src="teacher.avatar_pic" class="w-full hp100 br-24"></image>
				<image v-if="teacher.gender === 1" class="absolute bottom-0 right-0 w-32" src="/static/label-gender-male.svg"></image>
				<image v-else class="absolute bottom-0 right-0 w-32" src="/static/label-gender-female.svg"></image>
			</view>
			<view class="flex-auto mr-24 pt-12">
				<view class="flex gap-8 items-baseline mb-16">
					<text class="c-blue-1 fs-34">{{teacher.name}}</text>
					<view class="tag country">{{teacher.country}}</view>
					<view class="tag age">{{teacher.age}}</view>
				</view>
				<view class="c-gray-1 fs-24">{{teacher.desc}}</view>
			</view>
			<image v-if="teacher.playing" class="w-32" src="/static/icon-voice-selected.svg" @tap.stop.prevent="play(teacher)" />
			<image v-else class="w-32" src="/static/icon-voice-grey.svg" @tap.stop.prevent="play(teacher)" />
		</view>
	</view>
</template>

<script>
	import utils from '@/common/utils.js';
	import player from '@/common/player.js';
	

	export default {
		name: "teacherList",
		props: ['words', 'defaultId'],
		data() {
			return {
				teachers: [],
				lastTeacher: {}
			}
		},
		mounted() {
			utils.request('GET', '/api/teacher', {}, (res) => {
				// console.log(res)
				this.teachers = res.teachers
				if(this.defaultId) {
					this.teachers.forEach(val => {
						if(val.id == this.defaultId) {
							val.checked = true
							this.lastTeacher = val
						}
					})
				}
			})
		},
		methods: {
			choose(teacher) {
				if(teacher.id === this.lastTeacher.id) {
					return
				}
				this.lastTeacher.checked = false
				teacher.checked = true
				this.lastTeacher = teacher
				this.$emit('choose', teacher.id)
			},
			play(cd) {
				player.play(cd)
			}
		}
	}
</script>

<style>
.page {
	padding: 16rpx 32rpx;
	background-color: #FAFAFA;
}
.cell {
	padding: 24rpx 32rpx;
	background-color: #fff;
	height: 160rpx;
	box-sizing: border-box;
}
.avatar {
	width: 112rpx;
	height: 112rpx;
}

.tag {
	padding: 4rpx 12rpx;
	border-radius: 16rpx;
	font-size: 22rpx;
	flex-shrink: 0;
	align-self: baseline;
	display: flex;
	align-items: center;
}
.country {
	background: #E1FFEF;
	color: #2FB886;
}
.age {
	color: #2F98F7;
	background: #DCF3FF;
}
</style>