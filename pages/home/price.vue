<template>
	<view class="content p-4">
		<view class="flex flex-col gap-3">
			<text class="text-slate-800 text-base">
				“Anyone who has never made a mistake has never tried anything new.”– Albert Einstein
			</text>
			<text class="text-slate-600 text-sm">
				一个从不犯错误的人，从来没有尝试过任何新鲜事物。—— 爱因斯坦
			</text>
		</view>
		<view class="mt-4 grid grid-cols-2 gap-3">
			<view @tap="switchPlan('month')"
				class="border text-center border-gray-300 flex flex-col gap-3 py-4 rounded-lg"
				:class="{'border-primary' : plan == 'month'}">
				<view class="text-base text-gray-600">月度会员</view>
				<view class="text-bold text-gray-800 text-3xl text-primary">
					<text class="text-base">￥</text>60
				</view>
				<view class="text-sm text-gray-400">共30小时</view>
			</view>
			<view @tap="switchPlan('season')"
				class="border text-center border-gray-300 flex flex-col gap-3 py-4 rounded-lg"
				:class="{'border-primary' : plan == 'season'}">
				<view class="text-base text-gray-600">季度会员</view>
				<view class="text-bold text-gray-800 text-3xl text-primary">
					<text class="text-base">￥</text>150
				</view>
				<view class="text-sm text-gray-400">共90小时</view>
			</view>
			<view @tap="switchPlan('year')"
				class="border text-center border-gray-300 flex flex-col gap-3 py-4 rounded-lg"
				:class="{'border-primary' : plan == 'year'}">
				<view class="text-base text-gray-600">年度会员</view>
				<view class="text-bold text-gray-800 text-3xl text-primary">
					<text class="text-base">￥</text>300
				</view>
				<view class="text-sm text-gray-400">一年内畅用</view>
			</view>
			<view @tap="switchPlan('vip')"
				class="border text-center border-gray-300 flex flex-col gap-3 py-4 rounded-lg"
				:class="{'border-primary' : plan == 'vip'}">
				<view class="text-base text-gray-600">VIP会员</view>
				<view class="text-bold text-gray-800 text-3xl text-primary">
					<text class="text-base">￥</text>500
				</view>
				<view class="text-sm text-gray-400">终身畅用</view>
			</view>
		</view>
		<view class="mt-4 text-primary text-center">
			<text v-show="plan == 'month'">每天练习一小时</text>
			<text v-show="plan == 'season'">士别三月，刮目相看</text>
			<text v-show="plan == 'year'">与世界无障碍沟通</text>
			<text v-show="plan == 'vip'">让英语成为第二母语</text>
		</view>
		<view class="flex flex-col gap-4 mt-4">
			<button class="btn btn-primary" @tap="submit">立即升级</button>
		</view>
	</view>

</template>

<script>
	import utils from '@/utils.js';

	export default {
		data() {
			return {
				plan: 'month',

			}
		},
		methods: {
			switchPlan(plan) {
				// console.log('switch')
				this.plan = plan
			},
			submit() {
				utils.request('POST', '/api/bill', {
					plan: this.plan
				}, (res) => {
					console.log(res)
					uni.hideLoading()
					// console.log(res.data)
					var {
						wxpay,
						prepay_id
					} = res

					var payment = {
						timeStamp: wxpay.timeStamp,
						nonceStr: wxpay.nonceStr,
						package: "prepay_id=" + prepay_id,
						signType: wxpay.signType,
						paySign: wxpay.paySign,
						success(res) {
							console.log('success')
							console.log(res)
							uni.hideLoading()
						},
						fail(res) {
							console.log('success')
							console.log(res)
						}
					}
					// console.log(payment)
					uni.requestPayment(payment)
				})
			}
		},
	}
</script>

<style>

</style>