var magento = require('../magento_funcs');
var url = require('../public/javascripts/url_funcs.js');

exports.list = function(req, res){
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
    	res.render('product_list', { title: 'Product List', url: "/product", products: result, shop_param: shop_param });
    });
};

exports.index = function(req, res){
    res.render('product_index', {title: 'Bugwelder Sync' , magento_confs: magento.confs});
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
		res.render('product_atributes_image', { title: 'Product Info', url: "product/info_with_image/", atribute_values: result_atributes, atribute_names: atribute_names, images: result_image, shop_param: shop_param });
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
    	res.render('product_atributes', { title: 'Product Info', url: "/product/info/", atribute_values: result, atribute_names: atribute_names, shop_param: shop_param });
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

exports.image = function(req, res){
	var magento_conf = url.getURLShop(req, magento);
	var storeView = null;

    magento.catalog.product.attribute.media.list(req.params.product_id, storeView, magento_conf, function(error, result) {
    	var shop_param = url.setShopUrl('', req.query['shop']);
    	res.render('product_image_list', { title: 'Product Image', url: "/product/image/", images: result, shop_param: shop_param });
    });
};