
const promise = {
	0: '请求成功',
	1: '服务器内部错误',
	3: '返回值为空',


	1000: '该手机号已被注册',
	1001: '该手机短时间内请求验证次数过多，请稍后再试',
	1002: '验证码发送失败',
	1003: '无效的手机号码',
	1004: '无效的短信验证码',
	1005: 'regtoken为空',
	1006: 'regtoken无效或已超时',
	1007: 'password过弱',
	1008: '该手机号未注册',
	1009: '无效的token',
	1010: '该操作需要登录',
	1011: '无效的账号或密码',
	1012: '该账号真实姓名已设置',
	1013: '该账号身份证号已设置',
	1014: '无效的身份证号',
	1015: '该账号港澳通信证号已设置',
	1016: '该账号护照号已设置',
	1017: '无效的姓名',
	1018: '无效的护照号',
	1019: '无效的港澳通信证号',
	1020: '无效请求，个人信息没有保存',
	1021: 'wechat登陆失败',
	1022: '该账号已绑定手机号',
	1023: '该账号已绑定微信',
	1024: '该微信已绑定账号',
	1025: '频繁登陆该账号，请稍后再试',
	1026: '该昵称已存在',
	1027: '唯一性错误',
	1028: '无效的昵称',

	2000: '无效的订单id',
	2001: '订单已支付',
	2002: '订单关联比赛已过期',

	3000: '无效的serieid',
	3001: '无效的tourid',
	3002: '无效的matchid',
	3003: '无效的casionid',
	3004: '该场比赛已禁止买入',
	3005: '无效的门票数量',
	3006: '无效的支付方式',
	3007: '门票数量超过系统限制',
	3008: '门票总价超过系统限制',
	3009: '需完善个人信息才可参加比赛（真实姓名和身份证号）',
	3010: '需完善个人信息才可参加比赛（护照或港澳通信证号）',
	3011: '该场比赛禁止买入',

	4000: '无效的序列号',
	4001: '无效的比赛系列号',
	4002: '该序列号已使用',
	4003: '该序列号已过有效期',
	4004: '该序列号已被禁用',

	5001: '门票号不存在',
	5002: '该门票号不属于本俱乐部',
}

module.exports = function (error, value) {
	var no = error.toString(error)
	var msg = promise[no] || '未知错误号'
	var json = {
		code: no,
		msg: msg,
		value: value
	}
	return json
}
