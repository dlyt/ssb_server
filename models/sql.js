t.organization.findOne({
    attributes: ['name'],
    include: [{
        model: t.casino,
        include: [{
            model: t.address,
            include: [{
                model: t.city,
                include: [{
                    model: t.country,
                    where: {country: '中国'}
                }]
            }]
        }]
    }],
    //where: {image_url: {$ne: null}},
    //order: [['last_update', 'ASC']],
    //raw: true,
    //offset: 0,
    //limit: 2
}).then((result => {
    console.log('')
    console.log(JSON.stringify(result))
    console.log('')
}))


t.organization.findAll({
    include: [{
        model: t.casino,
        include: [{
            model: t.address,
            include: [{
                model: t.city,
                where: {city: '北京'}
            }]
        }]
    }, {
        model: t.dailyMatchSerie,
        include: [{
            model: t.dailyMatch
        }]
    }],
    //where: {image_url: {$ne: null}},
    //order: [['last_update', 'ASC']],
    //raw: true,
    //offset: 0,
    //limit: 2
}).then((result => {
    console.log('')
    //console.log(result)
    console.log(JSON.parse(JSON.stringify(result)))
    console.log('')
}))


t.organization.findAll({
    include: [{
        model: t.casino,
        include: [{
            model: t.address,
            include: [{
                model: t.city,
                include: [{
                    model: t.country,
                    where: {'country': {$ne: '中国'}}
                }]
            }]
        }]
    }, {
        model: t.bigMatchSerie,
        where: {},
        include: [{
            model: t.bigMatch,
            where: {}
        }]
    }],
    //where: {image_url: {$ne: null}},
    //order: [['last_update', 'ASC']],
    //raw: true,
    //offset: 0,
    //limit: 2
}).then((result => {
    console.log('')
    //console.log(result)
    console.log(JSON.parse(JSON.stringify(result)))
    console.log('')
}))


attributes: {
    include:
    [
        [Sequelize.fn('TIMESTAMPDIFF',
                      Sequelize.literal('MONTH'),
                      Sequelize.col('start_date'),
                      '2016-09-01'),
                      'start_date'],
        [Sequelize.fn('TIMESTAMPDIFF',
                    Sequelize.literal('MONTH'),
                    Sequelize.col('end_date'),
                    '2016-09-01'),
                    'end_date'],
    ]
},


const opts = {
    include: [
        {
            model: Address,
            attributes: {exclude: ['last_update']},
            include: [{
                model: City,
                attributes: {exclude: ['last_update']},
                where: city_where || {},
                include: [{
                    model: Country,
                    attributes: {exclude: ['last_update']},
                    where: country_where || {}
                }]
            }]
        },{
            model: Feature,
            attributes: ['feature'],
            through: {attributes: []}
        },{
            model: Organization,
            attributes: ['organization_id', 'name']
        }],
    offset: toInt(req.query.offset, 0),
    limit: toInt(req.query.limit, 5)
}
