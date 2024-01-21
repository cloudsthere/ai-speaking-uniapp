<template>
	<view class="content pt-4 px-4 pb-10">
		<view class="m-auto text-center">
			<image src="@/static/promote.jpeg" mode=""></image>
		</view>
		<view class="flex flex-col gap-4 mt-4">
			<view class="relative">
				<view v-if="has_code" class="w-fll text-center text-xl">{{code}}</view>
				<input v-else name="code" v-model="code" placeholder="邀请码" type="text"
					class="py-2 border-b text-center border-gray-200 m-auto" style="width: 50%;" />
			</view>
		</view>
		<view class="text-sm text-gray-400 mt-4 flex flex-col gap-2 list-disc" v-if="!has_code">
			<view class=""><label class="px-1 text-sky-500">•</label>您可定制专属邀请码，也可以自动生成</view>
			<view class=""><label class="px-1 text-sky-500">•</label>邀请码是4-10个字符，可包含字母、数字和下划线</view>
			<view class=""><label class="px-1 text-sky-500">•</label>不能是完全重复或连续的字符，如“1234”、“aaaa”</view>
			<view class=""><label class="px-1 text-sky-500">•</label>提交确认后不可修改</view>
		</view>
		<view class="flex flex-col gap-4 mt-4">
			<button class="btn btn-default" v-if="has_code" @click="copy">复制邀请码</button>
			<button class="btn btn-primary" v-if="has_code" @click="share" open-type="share">转发小程序</button>
			<navigator url="/pages/mine/withdraw" class="btn btn-default" v-if="has_code">提现<label class="px-1">•</label>￥{{balance / 100}}</navigator>
			<button class="btn btn-default" v-if="!has_code" @click="generate">随机生成</button>
			<button class="btn btn-primary" v-if="!has_code" @click="submit">提交</button>
		</view>
		<view class="text-sm text-gray-600 mt-10 flex flex-col">
			<view class="text-base text-center">推广奖励规则</view>
			<view class="text-sm text-gray-400 mt-4 flex flex-col gap-2 list-disc">
				<view class="flex">
					<label class="px-1 text-sky-500">•</label>
					<text>好友填写邀请码后，您和好友将同时获赠10分钟课时</text>
				</view>
				<view class="">
					<label class="px-1 text-sky-500">•</label>
					<text>好友购买会员后，您可获得支付金额的10%的佣金</text>
				</view>
			</view>
		</view>
		<view class="text-sm text-gray-600 mt-10 flex flex-col">
			<view class="text-base text-center">推广成果</view>
			<view class="flex gap-3 mt-2 justify-center">
				<text>累计佣金：￥{{history_commission / 100}}</text>
				<text>可提现：￥{{balance / 100}}</text>
			</view>
			<view class="mt-2">
				<uni-table border stripe emptyText="暂无更多数据" >
					<!-- 表头行 -->
					<uni-tr>
						<uni-th align="center">受邀者</uni-th>
						<uni-th align="center">类型</uni-th>
						<uni-th align="center">金额</uni-th>
						<uni-th align="center">订单时间</uni-th>
					</uni-tr>
					<!-- 表格数据行 -->
					<uni-tr v-if="commissions.length > 0" v-for="commission in commissions" :key="commission.id">
						<uni-td align="center">{{commission.invitee.name}}</uni-td>
						<uni-td align="center">{{commission.level}}级佣金</uni-td>
						<uni-td align="center">{{commission.amount / 100}}</uni-td>
						<uni-td align="center">{{commission.created_at}}</uni-td>
					</uni-tr>
				
				</uni-table>
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
				balance: 0
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

<style>

</style>