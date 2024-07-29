<template>
	<scroll-view scroll-y :style="{position: 'absolute', top: height + 'px', height: `calc(100% - ${height}px)`}" >
		<view class="content">
			<view class="flex gap-24">
				<image :src="user && user.avatar || '/static/default_avatar.jpg'" class="rounded-lg avatar no-shrink"></image>
				<view  v-if="user" class="flex justify-between flex-auto"  @click="routeTo({url: '/pages/mine/profile'})">
					<view class="flex flex-col justify-center gap-16">
						<view class="font-semibold fs-32 c-blue-1">
							{{user.name}}
						</view>
						<image v-if="member.is_member" class="no-stretch" src="/static/label-pro.svg" style="width: 82rpx;height: 34rpx" mode="aspectFit" />
						<view v-else class="br-16 flex items-center fs-20 c-white no-stretch normal_user">
							{{member.plan_name}}
						</view>
					</view>
					<view class="flex items-center">
						<image class="w-32" src="/static/icon-rightarrow.svg" />
					</view>
				</view>
				<view v-else class="flex flex-auto items-center"  @click="routeTo({url: '/pages/auth/login'})">
					<view class="font-semibold c-blue-1 fs-32">请登录/注册</view>
				</view>
			</view>
			<view class="sub-section" v-if="!member.is_member">
				<view class="flex justify-between items-center" style="margin-bottom: 10rpx;">
					<text class="fs-24 c-gray-4">剩余课时</text>
					<text class="font-semibold fs-34 c-blue-1">{{ `${member.available_minutes}/${member.total_minutes} min` }}</text>
				</view>
				
				<Progress :percent="member.available_minutes/member.total_minutes * 100" />
			</view>
			
			<navigator v-if="member.is_member" url="/pages/home/price" class="member_banner relative mt-2">
				<image class="member_banner w-full hp100" src="/static/icon-pro-banner.png" />
				<view class="front w-full hp100 flex items-center" style="padding-left: 36rpx;">
					<view class="flex flex-col">
						<image class="banner-text" src="/static/icon-banner-text.png" />
						<view class="fs-20" style="color: #FA931C;">有效期至{{ member.expires_at }}</view>
					</view>
				</view>
			</navigator>
			<navigator v-else url="/pages/home/price">
				<image class="member_banner" :src="domain + '/static/images/icon-banner.png'" />
			</navigator>
		</view>
		
		<view>
			<navigator url="/pages/mine/promote" class="cell flex justify-between" style="margin-top: 32rpx;">
				<text class="c-blue-1 fs-28 font-semibold">分享有奖</text>
				<view class="flex gap-16 items-center">
					<view class="tag c-white fs-24 flex items-center justify-center br-22" style="background-color: #FA9422;">赠送课时</view>
					<image class="w-32" src="/static/icon-rightarrow.svg" />
				</view>
			</navigator>
			
			<navigator url="/pages/mine/invite-code" class="cell flex justify-between">
				<text class="c-blue-1 fs-28 font-semibold">填写邀请码</text>
				<view class="flex gap-16 items-center">
					<view class="tag c-white fs-24 flex items-center justify-center br-22" style="background-color: #40BBFF;">9折优惠</view>
					<image class="w-32" src="/static/icon-rightarrow.svg" />
				</view>
			</navigator>
			
			<navigator url="/pages/mine/agent" class="cell flex justify-between">
				<text class="c-blue-1 fs-28 font-semibold">我的角色</text>
				<view class="flex gap-16 items-center">
					<image class="w-32" src="/static/icon-rightarrow.svg" />
				</view>
			</navigator>
			
			<navigator url="/pages/mine/voice" class="cell flex justify-between">
				<text class="c-blue-1 fs-28 font-semibold">我的声音</text>
				<view class="flex gap-16 items-center">
					<image class="w-32" src="/static/icon-rightarrow.svg" />
				</view>
			</navigator>
			
			<view v-if="user" @tap="showLogout" class="cell flex justify-between">
				<text class="c-blue-1 fs-28 font-semibold">退出登录</text>
				<view class="flex gap-16 items-center">
					<image class="w-32" src="/static/icon-rightarrow.svg" />
				</view>
			</view>
			
			<!-- <navigator url="/pages/mine/promote" class="cell flex justify-between">
				<text class="c-blue-1 fs-28 font-semibold">申请推广大使</text>
				<view class="flex gap-16 items-center">
					<image class="w-32" src="/static/icon-rightarrow.svg" />
				</view>
			</navigator> -->
		</view>
	</scroll-view>
</template>

<script>
	import utils from '@/common/utils.js';
	import Progress from '../component/progress.vue'

	export default {
		components:{
			Progress
		},
		data() {
			return {
				height: getApp().globalData.height,
				user: null,
				member: {
					plan_name: '-',
					total_minutes: '-',
					available_minutes: '-',
				},
				
				domain: utils.domain,
			}
		},
		onShow() {
			this.user = utils.getUser()

			utils.request('GET', '/api/member', {}, (res) => {
				// console.log(res)
				this.member = res.member
				// dev
				// this.member.is_member = true
			})
		},
		onShareAppMessage(res) {
			return utils.share()
		},
		onShareTimeline(res) {
			return utils.share()
		},
		methods: {
			routeTo(params) {
				uni.navigateTo(params)
			},
			getUserInfo() {
				wx.getUserProfile({
				      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
				      success: (res) => {
				        console.log(res)
				      }
				    })
			},
			bindGetUserInfo(e) {
				console.log(e.detail.userInfo)
				//
			},
			showLogout() {
				var that = this
				uni.showModal({
					content: '确认退出登录吗',
					success: function(res) {
						if (res.confirm) {
							that.logout()
						} else if (res.cancel) {
							// console.log('用户点击取消');
						}
					}
				});
			},
			logout() {
				if (this.user) {
					// console.log('request')
					utils.request('POST', '/api/logout', {}, (res) => {
						utils.deleteUser()
						utils.setToken(res.token)
						uni.reLaunch({
							url: '/pages/mine/mine',
						})
					})
				}

			}
		}
	}
</script>

<style lang="scss">
	page {
		height: 375rpx; 
		background-image: url(~@/static/chat-bg.jpg);
		background-size: 100% auto;
		background-repeat: no-repeat
	}
	.content {
		padding: 0 40rpx;
		box-sizing: border-box;
	}

	.avatar {
		width: 128rpx;
		height: 128rpx;
	}
	
	.normal_user {
		background-color: #1CD1AD;
		padding: 4rpx 12rpx;
	}
	
	.member_user {
		padding: 8rpx 14rpx;
		background: linear-gradient( 320deg, #FFA450 0%, #FFAC1B 22%, #FFB800 82%, #FFC700 100%);
	}
	
	.sub-section {
		margin: 44rpx 0;
	}
	
	.member_banner {
		width: 100%;
		height: 150rpx;
	}
	
	.banner-text {
		width: 168rpx;
		height: 33rpx;
		margin-bottom: 18rpx;
		flex-shrink: 0;
	}
	
	.tag {
		width: 128rpx;
		height: 42rpx;
	}
	
	.cell {
		padding: 32rpx 40rpx;
	}

	.bg-gradient {
		background-image: linear-gradient(to bottom, #38b5b3, #4dc3c1, #60d2d0, #72e0de, #83efed);
	}
</style>