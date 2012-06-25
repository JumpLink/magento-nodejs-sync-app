// sublime: tab_size 2; translate_tabs_to_spaces true
var magento = require('../magento_funcs');
var url = require('../public/javascripts/url_funcs.js');
var magento_confs = require('../config/magento_confs.js');
var sync_shops_confs = require('../config/sync_shops.js');

var render_parameters = { 
  title: 'Bugwelder Sync'
  , url: '' 
  , sync_shop: sync_shops_confs[0]
  , magento_confs: magento_confs
  , magento_shop: magento_confs[0]
}

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
      var parameters = render_parameters;
      if (req.query['shop'] != null)
        parameters.shop_param = url.setShopUrl('', req.query['shop']);
    	res.render('product_list', parameters);
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
    var parameters = render_parameters;
    parameters.filter_type = type;
    parameters.filter_value = value;
    parameters.filter_shop = shop;
    if (req.query['shop'] != null)
      parameters.shop_param = url.setShopUrl('', req.query['shop']);

    res.render('product_list_load', parameters );
};

exports.info_compare = function(req, res){
   // var magento_conf = url.getURLShop(req, magento);
    var parameters = render_parameters;
    parameters.sku = decodeURIComponent(req.query['sku']);
    if (req.query['shop'] != null) {
        parameters.filter_shop = decodeURIComponent(req.query['shop']);
        parameters.shop_param = url.setShopUrl('', req.query['shop']);
    }

    res.render('product_info_compare_load', parameters );
};


exports.index = function(req, res){
    res.render('product_index', render_parameters );
};

exports.info_and_image = function(req, res){
	var magento_conf = url.getURLShop(req, magento);
	var storeView = null;

	function render(result_attributes, result_image) {
		var i = 0;
    	var attribute_names = new Array();
    	for (x in result_attributes) {
    		attribute_names[i] = x;
    		i++;
    	}
    	console.log(result_attributes);
    	console.log(result_image);
    var parameter = render_parameters;
    parameter.title = 'Product Info';
    parameter.url = "product/info_with_image/";
    parameter.attribute_values = result_attributes;
    parameter.attribute_names = attribute_names;
    parameter.images = result_image;
    if (req.query['shop'] != null)
      parameter.shop_param = url.setShopUrl('', req.query['shop']);

		res.render('product_attributes_image', parameter );
	}

    magento.catalog.product.info_and_image(req.params.product_id, storeView, magento_conf, render);
};

exports.info = function(req, res){
	var magento_conf = url.getURLShop(req, magento);
	var storeView = null;

    magento.catalog.product.info(req.params.product_id, storeView, magento_conf, function(error, result) {
    	if (error) { throw error; }
    	//console.log(result);
    	var i = 0;
    	var attribute_names = new Array();
    	for (x in result) {
    		attribute_names[i] = x;
    		i++;
    	}

      var parameter = render_parameters;
      parameter.title = 'Product Info';
      parameter.url = "/product/info/";
      parameter.attribute_values = result;
      parameter.attribute_names = attribute_names;
      parameter.sync_shop = sync_shops_confs[0];
      if (req.query['shop'] != null)
        parameter.shop_param = url.setShopUrl('', req.query['shop']);

    	res.render('product_attributes', parameter);
    });
};

exports.image_info = function(req, res){
	var magento_conf = url.getURLShop(req, magento);
	var storeView = null;

    magento.catalog.product.attribute.media.info(req.params.product_id, storeView, magento_conf, function(error, result) {

      var parameter = render_parameters;
      parameter.title = 'Product Image Info';
      parameter.url = "/product/info/image/";
      parameter.images = result;
      if (req.query['shop'] != null)
        parameter.shop_param = url.setShopUrl('', req.query['shop']);

    	res.render('product_image_info', parameter);
    });
};

exports.delete = function(req, res){
    var magento_conf = url.getURLShop(req, magento);

    // magento.catalog.product.attribute.media.info(req.params.product_id, magento_conf, function(error, result) {
    //     var shop_param = url.setShopUrl('', req.query['shop']);
    //     res.render('product_delete', { title: 'Product Delete', url: "/product/delete/", product: result, shop_param: shop_param });
    // });
    var parameter = render_parameters;
    parameter.title = 'Product Delete';
    if (req.query['shop'] != null)
      parameter.shop_param = url.setShopUrl('', req.query['shop']);

    res.render('product_delete', parameter);
};

exports.image = function(req, res){
	var magento_conf = url.getURLShop(req, magento);
	var storeView = null;

    magento.catalog.product.attribute.media.list(req.params.product_id, storeView, magento_conf, function(error, result) {

      var parameter = render_parameters;
      parameter.title = 'Product Image';
      parameter.url = "/product/image/";
      parameter.images = result;
      if (req.query['shop'] != null)
        parameter.shop_param = url.setShopUrl('', req.query['shop']);

    	res.render('product_image_list', parameter);
    });
};