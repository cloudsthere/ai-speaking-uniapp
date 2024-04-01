<template>
	<view class="content flex flex-col justify-between">
		<view>
			<view style="margin-bottom: 48rpx;">
				<view class="flex justify-between">
					<view class="c-blue-1 fs-28 mb-18">
						Anyone who has never made a mistake <br/>
						has never tried anything new. <br/>
						–Albert Einstein
					</view>
					<image class="no-shrink" src="/static/bg-marks-yellow.png" style="width: 96rpx;height: 78rpx;" />
				</view>
				
				<view class="c-gray-1 fs-24">
					一个从不犯错误的人，从来没有尝试过任何新鲜事物。<br/>
					— 爱因斯坦
				</view>
			</view>
			
			<image class="w-full" :src="domain + '/static/images/banner-pro.png'" style="height: 202rpx" />
			
			<view class="mt-32 grid grid-cols-3 gap-24">
				<view v-for="(plan, index) in plans" :key="plan.plan" @tap="switchPlan(index)"
					class="price-box flex flex-col items-center gap-16 br-16 relative">
					<view class="c-blue-1 fs-28">{{plan.name}}</view>
					<view class="flex items-center" style="color: #FA931C">
						<text class="fs-28">￥</text>
						<text class="font-semibold" style="font-size: 56rpx;">{{plan.cost}}</text>
					</view>
					<view class="fs-24 c-gray-1">{{plan.dailyPay}} 元/天</view>
					<view class="absolute top-0 left-0 w-full hp100 br-16" :class="{'border-primary' : plan_index == index}"></view>
				</view>
			</view>
			<view class="mt-4 text-primary text-center">
				<text>{{plans[plan_index] ? plans[plan_index].quote : ''}}</text>
			</view>
			<view class="cell c-blue-1 gap-32">
				<text class="font-semibold">邀请码</text>
				<view v-if="has_invite_code">{{invite_code}}<text class="px-2">•</text><text class="">9折优惠</text></view>
				<input class="text-right" name="invite_code" v-else v-model="invite_code" @input="replaceInput" placeholder="选填，9折优惠" type="text" />
			</view>
		</view>
		<view class="w-full upgrade" @tap="submit">
			立即升级
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
				domain: utils.domain
			}
		},
		onLoad() {
			utils.request('GET', '/api/price', {}, (res) => {
				// console.log(res)
				this.plans = res.plans.map(val => {
					const daily = {
						month: 30,
						season: 92,
						year: 365
					}
					return Object.assign(val,{dailyPay: Math.round(val.cost / daily[val.plan]).toFixed(2)})
				})
				this.invite_code = res.invite_code
				if (res.invite_code) {
					this.has_invite_code = true
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
			replaceInput(e) {
				const value = e.detail.value.replaceAll(/[^A-Za-z0-9_]/g, '')
				setTimeout(() => { this.invite_code = value }, 0)
			},
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

<style scoped>
.content {
	padding: 40rpx 48rpx 56rpx;
	height: 100vh;
	box-sizing: border-box;
}
.upgrade {
	background-color: #FA931C;
	font-size: 32rpx;
	color: white;
	border-radius: 16rpx;
	height: 104rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}
.mb-18 {
	margin-bottom: 18rpx;
}
.cell {
	width: 100%;
	height: 100rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
	font-size: 28rpx;
	padding: 0;
	border: none;
}

.price-box {
	height: 244rpx;
	padding: 40rpx 0;
	background: #FAFAFA;
	box-sizing: border-box;
}
.border-primary {
	border: 4rpx solid #FA9D35;
}
</style>