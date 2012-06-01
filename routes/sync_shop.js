var url = require('../public/javascripts/url_funcs.js');
var download = require('../download_file.js');
var fs = require('fs');
var sync_shops_confs = require('../config/sync_shops.js');

exports.index = function(req, res) {
	res.render('sync_shop_index', {title: sync_shops_confs[0].name + ' Sync' });
};

exports.product = function(req, res) {
	//download.wget(file_uri, './downloads/+sync_shops_confs[0].url+'/product');
	var product = JSON.parse(fs.readFileSync('./downloads/'+sync_shops_confs[0].url+'/product/177350'));
	//console.log(product);
	res.render('product_atributes', { title: sync_shops_confs[0].name, url: "/"+sync_shops_confs[0].url+"/product/", atribute_values: product.DATA, atribute_names: product.COLUMNS, shop_param: '' });
};