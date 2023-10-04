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
			<view v-for="(plan, index) in plans" :key="plan.plan" @tap="switchPlan(index)"
				class="border text-center border-gray-300 flex flex-col gap-3 py-4 rounded-lg"
				:class="{'border-primary' : plan_index == index}">
				<view class="text-base text-gray-600">{{plan.name}}</view>
				<view class="text-bold text-gray-800 text-3xl text-primary">
					<text class="text-base">￥</text>{{plan.cost}}
				</view>
				<view class="text-sm text-gray-400">{{plan.desc}}</view>
			</view>
		</view>
		<view class="mt-4 text-primary text-center">
			<text>{{plans[plan_index] ? plans[plan_index].quote : ''}}</text>
		</view>
		<view class="mt-4 flex gap-3 text-gray-600 items-center">
			<label for="">邀请码</label>
			<view class="" v-if="has_invite_code">{{invite_code}}<text class="px-2">•</text><text class="">9折优惠</text></view>
			<input name="invite_code" v-else v-model="invite_code" placeholder="选填，9折优惠" type="number"
				class="py-2 border-b border-gray-200 " />
		</view>
		<view class="flex flex-col gap-4 mt-4">
			<button class="btn btn-primary" @tap="submit">立即升级</button>
		</view>
	</view>

</template>

<script>
	import utils from '@/common/utils.js';

	export default {
		data() {
			return {
				plan_index: 0,
				invite_code: '',
				has_invite_code: false,
				plans: [],
			}
		},
		onLoad() {
			var that = this
			utils.request('GET', '/api/price', {}, (res) => {
				// console.log(res)
				that.plans = res.plans
				that.invite_code = res.invite_code
				if (res.invite_code) {
					that.has_invite_code = true
				}
			})
		},
		onShareAppMessage(res) {
			return utils.share()
		},
		onShareTimeline(res) {
			return utils.share()
		},
		methods: {
			switchPlan(index) {
				// console.log('switch')
				this.plan_index = index
			},
			submit() {
				if (!utils.getUser()) {
					utils.loginFirst()
					return;
				}
				if (this.invite_code && !utils.validateInviteCode(this.invite_code)) {
					uni.showToast({
						title: '请填入正确的邀请码',
						icon: 'none'
					})
					return;
				}
				uni.showLoading({
					title: '加载中'
				})
				utils.request('POST', '/api/bill', {
					plan: this.plans[this.plan_index].plan,
					invite_code: this.invite_code
				}, (res) => {
					// console.log(res)
					uni.hideLoading()
					// console.log(res.data)
					if (res.error == 0) {
						var {
							wxpay,
							prepay_id
						} = res

						var payment = {
							timeStamp: wxpay.timeStamp,
							nonceStr: wxpay.nonceStr,
							package: wxpay.package,
							signType: wxpay.signType,
							paySign: wxpay.paySign,
							success(res) {
								// console.log('success')
								// console.log(res)
								// uni.hideLoading()
								uni.switchTab({
									url: '/pages/mine/mine'
								})
							},
							fail(res) {
								console.log('fail')
								console.log(res)
								uni.hideLoading()
							}
						}
						// console.log(payment)
						uni.requestPayment(payment)
					} else {
						uni.showToast({
							title: res.msg,
							icon: 'none'
						})
					}

				})
			}
		},
	}
</script>

<style>

</style>