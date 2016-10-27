
module.exports = (db) => {
	/* 顺序应按照先主表 后从表的顺序排列 */
	return {
		Country: require('./country')(db),
		City: require('./city')(db),
		Address: require('./address')(db),
		Casino: require('./casino')(db),
		Feature: require('./feature')(db),
		CasinoFeature: require('./casinoFeature')(db),
		CasinoVip: require('./casinoVip')(db),
		CasinoImage: require('./casinoImage')(db),
		Organization: require('./organization')(db),
		ExchangeRate: require('./exchangeRate')(db),
		BigMatchSerie: require('./bigMatchSerie')(db),
		BigMatchTour: require('./bigMatchTour')(db),
		BigMatch: require('./bigMatch')(db),
		BigMatchResult: require('./bigMatchResult')(db),
		MatchSetting: require('./matchSetting')(db),
		DailyMatchSerie: require('./dailyMatchSerie')(db),
		DailyMatch: require('./dailyMatch')(db),
		DailyMatchResult: require('./dailyMatchResult')(db),
		Order: require('./order')(db),
		OrderDetail: require('./orderDetail')(db),
		Payment: require('./payment')(db),
		User: require('./user')(db),
		UserPoint: require('./userPoint')(db),
		SerialNumber: require('./serialNumber')(db),
		Secret: require('./secret')(db),
		GlobalSetting: require('./globalSetting')(db),
		Business: require('./business')(db),
		Feedback: require('./feedback')(db),
	}
}
