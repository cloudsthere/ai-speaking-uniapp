
export default {
	domain: 'https://yw.dev.ai7.pro',
	// domain: 'http://ai-speaking.local',
	// #ifdef MP-WEIXIN
	version: 'wx-0.0.8',
	// #endif
	// #ifdef MP-TOUTIAO
	version: 'dy-0.0.8',
	// #endif
	// #ifdef MP-KUAISHOU
	version: 'ks-0.0.8',
	// #endif
	// #ifdef MP-TOUTIAO
	platform: 'douyin',
	// #endif
	// #ifdef MP-KUAISHOU
	platform: 'kuaishou',
	// #endif
	// #ifdef MP-WEIXIN
	platform: 'weixin',
	// #endif
	is_waiting_login: false,
	isAuth() {
		if (!getApp().globalData.user) {
			let user = uni.getStorageSync('user')
			if (user) {
				getApp().globalData.user = user
				return true
			} else {
				return false
			}
		} else {
			return true;
		}
	},
	getUser() {
		let user = getApp().globalData.user
		if (!user) {
			let user = uni.getStorageSync('user')
			if (user) {
				getApp().globalData.user = user
				return user
			} else {
				return false
			}
		} else {
			return user;
		}
	},
	setUser(user) {
		getApp().globalData.user = user
		uni.setStorageSync('user', user)
	},
	setToken(token) {
		getApp().globalData.token = token
		uni.setStorageSync('token', token)
	},
	getToken() {
		let token = getApp().globalData.token
		if (token) {
			return token;
		} else {
			let token = uni.getStorageSync('token')
			if (token) {
				return token
			}
		}
	},
	deleteUser() {
		getApp().globalData.user = null
		uni.removeStorageSync('user')
	},
	loginFirst() {
		uni.showModal({
			// title: '',
			content: '请先登录',
			confirmText: '去登录',
			success: function(res) {
				if (res.confirm) {
					uni.navigateTo({
						url: '/pages/auth/login'
					})
				} else if (res.cancel) {
					console.log('用户点击取消');
				}
			}
		});
	},
	/**
	 * @param {string} date_str YYYY-mm-dd
	 */
	readableDate(dateTime) {
		if (!dateTime) {
			return '';
		}
		// console.log(dateTime)
		// 用毫秒表示分钟、小时、天、周、月
		let minute = 1000 * 60;
		let hour = minute * 60;
		let day = hour * 24;
		let week = day * 7;
		let month = day * 30;
		// 获取当前时间并转换为时间戳，方便计算
		let timestamp_current = new Date().getTime();

		// 将传入的时间格式字符串解析为Date对象
		let _date = new Date(dateTime);

		// 将Date对象转换为时间戳，方便计算
		let timestamp_input = _date.getTime();

		// 计算当前时间与传入的时间之间相差的时间戳
		let timestamp_diff = timestamp_current - timestamp_input;

		// 计算时间差共有多少个分钟
		let minC = timestamp_diff / minute;
		// 计算时间差共有多少个小时
		let hourC = timestamp_diff / hour;
		// 计算时间差共有多少个天
		let dayC = timestamp_diff / day;
		// 计算时间差共有多少个周
		let weekC = timestamp_diff / week;
		// 计算时间差共有多少个月
		let monthC = timestamp_diff / month;

		// if (monthC >= 1 && monthC < 4) {
		//     return parseInt(monthC) + "月前";
		// } else if (weekC >= 1 && weekC < 4) {
		//     return parseInt(weekC) + "周前";
		// } else if (dayC >= 1 && dayC < 7) {
		//     return parseInt(dayC) + "天前";
		if (hourC >= 1 && hourC < 24) {
			return parseInt(hourC) + "小时前";
		} else if (minC >= 1 && minC < 60) {
			return parseInt(minC) + "分钟前";
		} else if ((timestamp_diff >= 0) && (timestamp_diff <= minute)) {
			// 时间差大于0并且小于1分钟
			return "刚刚";
		} else {
			// return _date.getFullYear() + "-" + _date.getMonth() + "-" + _date.getDate();
			return (_date.getMonth() + 1) + "-" + _date.getDate() + ' ' + _date.getHours().toString().padStart(2, '0') +
				':' + _date.getMinutes().toString().padStart(2, '0')
		}
	},
	// 当天0点时间戳
	todayStartOf() {
		return parseInt(new Date(this.formatDate(new Date(), 'Y-M-D') + ' 00:00:00').getTime() / 1000)
	},
	/**
	 * 格式化日期
	 * @param {string | number | Date} value 指定日期
	 * @param {string} format 格式化的规则
	 * @example
	 * ```js
	 * formatDate();
	 * formatDate(1603264465956);
	 * formatDate(1603264465956, "h:m:s");
	 * formatDate(1603264465956, "Y年M月D日");
	 * ```
	 */
	formatDate(date, format = "Y-M-D h:m:s") {
		const formatNumber = n => `0${n}`.slice(-2);
		// const date = new Date(value);
		const formatList = ["Y", "M", "D", "h", "m", "s"];
		const resultList = [];
		resultList.push(date.getFullYear().toString());
		resultList.push(formatNumber(date.getMonth() + 1));
		resultList.push(formatNumber(date.getDate()));
		resultList.push(formatNumber(date.getHours()));
		resultList.push(formatNumber(date.getMinutes()));
		resultList.push(formatNumber(date.getSeconds()));
		for (let i = 0; i < resultList.length; i++) {
			format = format.replace(formatList[i], resultList[i]);
		}
		return format;
	},
	getNowTimestamp() {
		return parseInt((new Date()).getTime() / 1000)
	},
	share() {
		return {
			title: '你的专属AI英语外教',
			path: '/pages/home/index',
			imageUrl: '/static/share.png'
		}
	},
	request(method, uri, data, success) {
		this.runAfterLogin((token) => {
			// console.log(method)
			// let domain = 'http://inshub.test';
			let url = this.domain + uri
			// console.log(this.version)
			let request_object = {
				url,
				method,
				data,
				success(res) {
					// console.log('success', res);
					if (res.statusCode == 401) {
						getApp().globalData.token = null
						uni.removeStorageSync('token')
						uni.removeStorageSync('token_expires_at')

						uni.reLaunch({
							url: '/pages/conversation/index',
							success() {
								// console.log('relaunch success')
							},
							complete(res) {
								// console.log('relaunch complete', res)
							}
						})


					} else if (res.statusCode != 200) {
						uni.showToast({
							title: `网络错误，请稍后再试(${res.statusCode})`,
							icon: 'error',
						})
					} else {
						success(res.data)
					}

				},
				complete(res) {
					// console.log('complete', res)
					// token 过期

				},
				fail(res) {
					// console.log('fail', res)
					uni.showToast({
						title: '网络错误，请稍后再试',
						icon: 'error',
					})
				},
				header: {
					Authorization: 'Bearer ' + token,
					Version: this.version,
					Accept: 'application/json',
					Platform: this.platform
				}
			}
			// console.log(request_object)
			uni.request(request_object)
		})

	},
	// 是否连续的字符
	hasConsecutiveChars(s) {
	    // 首先，使用正则表达式进行基本验证：长度是否在4到10之间，字符是否为数字或字母。
	    if (!/^[a-zA-Z0-9]{4,10}$/.test(s)) {
	        return false;
	    }
	
	    for (let i = 1; i < s.length; i++) {
	        // 通过比较每个字符的ASCII码，检查是否连续。
	        if (s.charCodeAt(i) !== s.charCodeAt(i - 1) + 1) {
	            return false;
	        }
	    }
	    return true;
	},
	validateInviteCode(code) {
		return /^[a-zA-Z0-9\_]{4,10}$/.test(code)
	},
	authGuard() {
		if (!this.getUser()) {
			// 用navigateTo的体验不好
			uni.reLaunch({
				url: '/pages/auth/login'
			})
		}
	},
	runAfterLogin(func) {
		// console.log('runafter')
		// let token = getApp().globalData.token
		// console.log(token)
		let app = getApp()
		let token = app.globalData.token;

		if (token) {
			// 有全局token，直接执行
			// console.log('全局token')
			func(token)
		} else {
			token = uni.getStorageSync('token')
			// console.log('storage token', token)
			if (token) {
				// 本地有可用token，执行
				// console.log('本地')
				app.globalData.token = token
				func(app.globalData.token)
			} else {
				// console.log('请求token')
				// 无可用token
				let that = this
				var sit = setInterval(function() {
					// console.log('等')
					token = getApp().globalData.token
					if (token) {
						clearInterval(sit)
						func(token)
					}
				}, 100)

				if (!that.is_waiting_login) {
					that.is_waiting_login = true
					// console.log('发login请求')
					uni.login({
						success: function(res) {
							// console.log(res.code)
							// return;
							uni.request({
								url: that.domain + '/api/token',
								method: 'POST',
								data: {
									code: res.code,
								},
								header: {
									Accept: 'application/json',
									Version: that.version,
									Platform: that.platform
								},
								success(login_res) {
									// console.log('login success')
									// console.log(login_res)
									that.setToken(login_res.data.token)
									// uni.setStorageSync('token_expires_at', login_res.data.expires_at)

									// 打开锁
									that.is_waiting_login = false
								}
							})


						}
					})
				}

			}
		}



	},
	unique(array) {

		var arr = []; //新建一个临时数组

		for (var i = 0; i < array.length; i++) { //遍历当前数组

			if (arr.indexOf(array[i]) == -1) { //当前数组的第i个值在新数组中找不到，则添加到新数组中去

				arr.push(array[i]);

			}

		}

		return arr;

	},
	arrayBufferToText(arrayBuffer) {
	  let byteArray = new Uint8Array(arrayBuffer);
	  let str = '';
	  for (let i = 0; i < byteArray.length; i++) {
	    str += String.fromCharCode(byteArray[i]);
	  }
	  return str;
	},

	
	// 根据某个字段分段数组
	chunk(arr, key, formKey) {
		const res = []
		arr.forEach(val => {
			const formattedKey = formKey ? formKey(val[key]) : val[key]
			if(res.length === 0 || res[res.length - 1].key !== formattedKey) {
				res.push({
					key: formattedKey,
					items: [val]
				})
			} else {
				res[res.length - 1].items.push(val)
			}
		})
		
		return res
	},

	isEqualDate(targetDate, date) {
		var target = new Date(targetDate);
		
		return (
			target.getDate() === date.getDate() &&
			target.getMonth() === date.getMonth() &&
			target.getFullYear() === date.getFullYear()
		  );
	} 
}