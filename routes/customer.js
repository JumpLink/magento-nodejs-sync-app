var magento = require('../magento_funcs');

exports.index = function(req, res){
    res.render('customer_index', {title: 'Bugwelder Sync' });
};