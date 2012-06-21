// sublime: tab_size 2; translate_tabs_to_spaces true
var magento = require('../magento_funcs');
var url = require('../public/javascripts/url_funcs.js');
var magento_confs = require('../config/magento_confs.js');
var sync_shops_confs = require('../config/sync_shops.js');

exports.list_iframe = function(req, res){
	var magento_conf = url.getURLShop(req, magento);
	var storeView = null;
	var filter = null;
	/* Filter nach URL */
	if (req.params.sku != null)
		filter = magento.set_filter.sku(req.params.sku);
	else if (req.params.name != null)
		filter = magento.set_filter.name(req.params.name);
	else if (req.params.product_id != null)
		filter = magento.set_filter.product_id(req.params.product_id);
	else if (req.params.set != null)
		filter = magento.set_filter.set(req.params.set);
	else if (req.params.type != null)
		filter = magento.set_filter.type(req.params.type);

	
	/* Shop-Config nach URL-Paramter */
	var magento_conf = url.getURLShop(req, magento);

	/* Filter urch URL-Parameter */
	if (req.query['name']) {
		var filter_value = decodeURIComponent(req.query['name']) 
		filter = magento.set_filter.name(filter_value);
		console.log('name: ' + filter_value);
	}
	else if (req.query['sku']) {
		var filter_value = decodeURIComponent(req.query['sku'])
		filter = magento.set_filter.sku(filter_value);
	}

	/* Magentofuntion zum rendern der Seite mit Filter und magento config */
    magento.catalog.product.list(filter, storeView, magento_conf, function(error, result) {
    	var shop_param = url.setShopUrl('', req.query['shop']);
    	res.render('product_list', { title: 'Product List', url: "/product", products: result, shop_param: shop_param, sync_shop: sync_shops_confs[0]});
    });
};

exports.list = function(req, res){
    var magento_conf = url.getURLShop(req, magento);
    var shop = null;
    var value = null;
    var type = null;

    if (req.query['shop'] != null) {
        shop = decodeURIComponent(req.query['shop']);
    }

    /* Filter nach URL */
    if (req.params.sku != null) {
        value = req.params.sku;
        type = 'SKU';
    }
    else if (req.params.name != null) {
        value = req.params.name;
        type = 'Name';
    }
    else if (req.params.product_id != null) {
        value = req.params.product_id;
        type = 'Product';
    }
    else if (req.params.set != null) {
        value = req.params.set;
        type = 'Set';
    }
    else if (req.params.type != null) {
        value = req.params.type;
        type = 'Type';
    }
    
    /* Shop-Config nach URL-Paramter */
    var magento_conf = url.getURLShop(req, magento);

    /* Filter durch URL-Parameter */
    if (req.query['name']) {
        value = decodeURIComponent(req.query['name']) 
        type = 'Name';
    }
    else if (req.query['sku']) {
        value = decodeURIComponent(req.query['sku'])
        type = 'SKU';
    }
    res.render('product_list_load', {title: 'Bugwelder Sync' , magento_confs: magento.confs, magento_shop: magento_confs[0], filter_type: type, filter_value: value, filter_shop: shop, sync_shop: sync_shops_confs[0]});
};

// exports.list_load = function(req, res){
//     res.render('product_list_load', {title: 'Bugwelder Sync' , magento_confs: magento.confs, magento_shop: magento_confs[0]});
// };


exports.index = function(req, res){
    res.render('product_index', {title: 'Bugwelder Sync' , magento_confs: magento.confs, magento_shop: magento_confs[0], sync_shop: sync_shops_confs[0]});
};

exports.info_and_image = function(req, res){
	var magento_conf = url.getURLShop(req, magento);
	var storeView = null;
	var shop_param = url.setShopUrl('', req.query['shop']);

	function render(result_atributes, result_image) {
		var i = 0;
    	var atribute_names = new Array();
    	for (x in result_atributes) {
    		atribute_names[i] = x;
    		i++;
    	}
    	console.log(result_atributes);
    	console.log(result_image);
		res.render('product_atributes_image', { title: 'Product Info', url: "product/info_with_image/", atribute_values: result_atributes, atribute_names: atribute_names, images: result_image, shop_param: shop_param, sync_shop: sync_shops_confs[0] });
	}

    magento.catalog.product.info_and_image(req.params.product_id, storeView, magento_conf, render);
    //  {
    // 	if (error) { throw error; }
    // 	var shop_param = url.setShopUrl('', req.query['shop']);
    // 	//console.log(result);
    // 	var i = 0;
    // 	var atribute_names = new Array();
    // 	for (x in result) {
    // 		atribute_names[i] = x;
    // 		i++;
    // 	}
    // 	
    // });
};

exports.info = function(req, res){
	var magento_conf = url.getURLShop(req, magento);
	var storeView = null;

    magento.catalog.product.info(req.params.product_id, storeView, magento_conf, function(error, result) {
    	if (error) { throw error; }
    	var shop_param = url.setShopUrl('', req.query['shop']);
    	//console.log(result);
    	var i = 0;
    	var atribute_names = new Array();
    	for (x in result) {
    		atribute_names[i] = x;
    		i++;
    	}
    	res.render('product_atributes', { title: 'Product Info', url: "/product/info/", atribute_values: result, atribute_names: atribute_names, shop_param: shop_param, sync_shop: sync_shops_confs[0] });
    });
};


exports.image_info = function(req, res){
	var magento_conf = url.getURLShop(req, magento);
	var storeView = null;

    magento.catalog.product.attribute.media.info(req.params.product_id, storeView, magento_conf, function(error, result) {
    	var shop_param = url.setShopUrl('', req.query['shop']);
    	res.render('product_image_info', { title: 'Product Image Info', url: "/product/info/image/", images: result, shop_param: shop_param });
    });
};

exports.delete = function(req, res){
    var magento_conf = url.getURLShop(req, magento);

    // magento.catalog.product.attribute.media.info(req.params.product_id, magento_conf, function(error, result) {
    //     var shop_param = url.setShopUrl('', req.query['shop']);
    //     res.render('product_delete', { title: 'Product Delete', url: "/product/delete/", product: result, shop_param: shop_param });
    // });
    res.render('product_delete', {title: 'Product Delete' , magento_conf: magento.conf});
};

exports.image = function(req, res){
	var magento_conf = url.getURLShop(req, magento);
	var storeView = null;

    magento.catalog.product.attribute.media.list(req.params.product_id, storeView, magento_conf, function(error, result) {
    	var shop_param = url.setShopUrl('', req.query['shop']);
    	res.render('product_image_list', { title: 'Product Image', url: "/product/image/", images: result, shop_param: shop_param });
    });
};