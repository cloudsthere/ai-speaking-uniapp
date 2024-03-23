<template>
	<view class="content" :style="{paddingBottom: bottom + 'rpx'}">
		<view class="banner relative">
			<image class="w-full hp100" src="@/static/bg-share.jpg" mode=""></image>
			<text class="label absolute fs-32">邀请码</text>
		</view>
		<view class="p-50">
			<view class="box-border input flex justify-between items-center">
				<input name="code" :disabled="has_code" v-model="code" placeholder="定制专属邀请码" type="text"
					class="box-border" />
				<image class="w-48"  v-if="!has_code" @click="generate" src="/static/icon-random.svg" />
				<image class="w-48"  v-else @click="copy" src="/static/icon-copy.svg" />
			</view>
			<view class="mt-16" v-if="!has_code">
				<p class="c-blue-1 fs-24">定制邀请码：4~10字符，限字母、数字、下划线，避免重复或连续字符，如“1234”、“aaaa”，且提交确认后不可更改。</p>
			</view>
			<view v-if="!has_code" class="box-border mt-32">
				<button class="box-border fs-32 c-white btn btn-primary" @click="submit" >提交</button>
			</view>
			<!-- <view class="flex flex-col gap-4 mt-4">
				<button class="btn btn-primary" v-if="has_code" @click="share" open-type="share">转发小程序</button>
				<navigator url="/pages/mine/withdraw" class="btn btn-default" v-if="has_code">提现<label class="px-1">•</label>￥{{balance / 100}}</navigator>
			</view> -->
			<view class="flex flex-col mt-48">
				<view class="flex gap-24 justify-center items-center">
					<image src="/static/bg-marks-left.svg" style="width:30rpx; height: 24rpx" />
					<text class="fs-32 c-blue-1 font-semibold">推广奖励规则</text>
					<image src="/static/bg-marks-right.svg" style="width:30rpx; height: 24rpx" />
				</view>
				<view class="mt-32 flex flex-col items-center c-blue-1 fs-24">
					<text>1.好友填写邀请码后，您和好友将同时获赠10分钟课时</text>
					<text>2.好友购买会员后，您可获得支付金额的10%的佣金</text>
				</view>
			</view>
			<view class="mt-48 bg-gray-2 table-box">
				<view class="text-center fs-32 c-blue-1 font-semibold mb-32">推广成果</view>
				<!-- <view class="flex gap-3 mt-2 justify-center">
					<text>累计佣金：￥{{history_commission / 100}}</text>
					<text>可提现：￥{{balance / 100}}</text>
				</view> -->
				<view class="mt-2 w-full">
					<uni-table class="w-full" emptyText="你目前还没邀请好友哦~">
						<!-- 表头行 -->
						<uni-tr>
							<uni-th width="65rpx" align="center">受邀者</uni-th>
							<uni-th width="65rpx" align="center">类型</uni-th>
							<uni-th width="65rpx" align="center">邀请时间</uni-th>
							<uni-th width="65rpx" align="center">奖励</uni-th>
						</uni-tr>
						<!-- 表格数据行 -->
						<uni-tr v-if="commissions.length > 0" v-for="commission in commissions" :key="commission.id">
							<uni-td align="center">{{commission.invitee.name}}</uni-td>
							<uni-td align="center">{{commission.level}}级佣金</uni-td>
							<uni-td align="center">{{commission.created_at}}</uni-td>
							<uni-td align="center">{{commission.amount / 100}}</uni-td>
						</uni-tr>
					
					</uni-table>
				</view>
				

			</view>
			
		</view>
	</view>
</template>

<script>
	import utils from '@/common/utils.js';

	export default {
		data() {
			return {
				code: null,
				has_code: false,
				commissions: [],
				history_commission: 0,
				balance: 0,
				bottom: getApp().globalData.bottom
			}
		},
		onLoad() {
			// console.log('user', utils.getUser())
			
			var that = this
			utils.request('GET', '/api/invite-code', {}, (res) => {
				// console.log(res)
				if (res.code) {
					that.code = res.code
					that.has_code = true
				}
			})
			utils.request('GET', '/api/commission', {}, (res) => {
				that.commissions = res.commissions
				that.history_commission = res.history_commission
				that.balance = res.balance
			})
		},
		onShow() {
			utils.authGuard()
		},
		onShareAppMessage(res) {
			return utils.share()
		},
		onShareTimeline(res) {
			return utils.share()
		},
		methods: {
			copy() {
				uni.setClipboardData({
					data: this.code,
					showToast: true,
					success() {
						console.log('success');
					}
				});
			},
			submit() {
				// console.log('code', this.code)
				if (/^(.)\1{3,9}$/.test(this.code)) {
					uni.showToast({
						title: '不能是完全重复的字符',
						icon: 'none'
					})
					return
				}
				
				if (utils.hasConsecutiveChars(this.code)) {
					uni.showToast({
						title: '不能是完全连续的字符',
						icon: 'none'
					})
					return
				}
				
				if (!utils.validateInviteCode(this.code)) {
					uni.showToast({
						title: '请填写正确的邀请码',
						icon: 'none'
					})
					return
				}
				// console.log('ok')
				// return;
				
				var that = this
				utils.request('POST', '/api/invite-code', {
					code: this.code
				}, (res) => {
					// console.log(res)
					if (res.error != 0) {
						uni.showToast({
							title: res.msg,
							icon: 'error'
						})
					} else {
						uni.showToast({
							title: '成功',
						})
						that.has_code = true
						that.code = res.code
					}
				})
			},
			generate() {
				var that = this
				utils.request('GET', '/api/generate-code', {}, (res) => {
					// console.log(res)
					that.code = res.code
				})
			}
		},
	}
</script>

<style scoped>
.banner {
	width: 100%;
	height: 348rpx;
}
.p-50 {
	padding: 0 50rpx;
}
.input {
	height: 112rpx;
	padding: 0 40rpx;
	line-height:　112rpx;
	background-color: #F3F4F6;
	font-size: 36rpx;
	font-weight: 600;
	border-radius: 16rpx;
	width: 100%;
}
.label {
	bottom: 16rpx;
	left: 50rpx;
	font-weight: bold;
}
.btn-primary {
	background-color: #1CD1AD;
	text-align: center;
	height: 104rpx;
	line-height: 104rpx;
	width: 100%;
	border: none;
}
.mt-48 {
	margin-top: 48rpx;
}
.mt-40 {
	margin-top: 40rpx;
}
.mb-32 {
	margin-bottom: 32rpx;
}
.table-box {
	padding-top: 40rpx;
	border-radius: 16rpx;
}

>>> .uni-table {
	width: 100%;
	background-color: #FAFAFA;
}
>>> .uni-table-scroll {
	overflow-x: unset;
}
>>> .uni-table-th {
	border: none;
	color: #151727;
	font-size: 24rpx;
}
>>> .uni-table-td {
	color: #151727;
}
>>> .uni-table-loading {
	height: 120rpx;
}
>>> .uni-table-text {
	width: 100%;
	color: #151727;
	font-size: 24rpx;
}
</style>