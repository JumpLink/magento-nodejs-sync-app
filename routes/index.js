var url = require('../public/javascripts/url_funcs.js');
var sync_shops_confs = require('../config/sync_shops.js');
var magento_confs = require('../config/magento_confs.js');

exports.index = function(req, res) {
   res.render('index', {title: magento_confs[0].name + ' Sync' });
};

exports.menu = function(req, res, next) {
	if (url.is_iframe(req, res)) {
		next();
	} else {
		console.log('Menu aufgerufen');
		res.render('menu', { title: magento_confs[0].name + ' Sync',  iframe_url: url.setIframeUrl(req.url), sync_shop: sync_shops_confs[0],  magento_shop: magento_confs[0], });
	}
}