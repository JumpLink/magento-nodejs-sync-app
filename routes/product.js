// sublime: tab_size 2; translate_tabs_to_spaces true
// var magento = require('../magento_funcs');
// var url = require('../public/javascripts/url_funcs.js');
// var magento_confs = require('../config/magento_confs.js');
// var sync_shops_confs = require('../config/sync_shops.js');
module.exports = function (app, magento, url, magento_confs, sync_shops_confs) {

  function render_parameters(req) {
    var parameters = {};
    parameters.filter_type = null;
    parameters.filter_value = null;
    parameters.filter_shop = null;
    parameters.title = 'Bugwelder Sync';
    parameters.sync_shop = sync_shops_confs[0];
    parameters.magento_confs = magento_confs;
    parameters.magento_shop = magento_confs[0];
    parameters.url = parameters.magento_shop.url + '/product';

    if (!(typeof req === 'undefined' || req == null || typeof req.query === 'undefined')) {
      console.log(req);

      parameters.storeView = url.getURLStoreView(req);
      parameters.current_magento_conf = url.getURLStoreView(req);

      if (typeof req.query['shop'] === 'undefined') {
        console.log('req.query[shop] is undefined');
      }
      else {
        parameters.shop_param = url.setShopUrl('', req.query['shop']);
        parameters.filter_shop = decodeURIComponent(req.query['shop']);
        parameters.shop_nr = req.query['shop'];
      }

      /* Filter nach URL */
      if (typeof req.params.sku !== 'undefined' && req.params.sku != null) {
          parameters.filter_value = req.params.sku;
          parameters.filter_type = 'SKU';
          parameters.filter = magento.set_filter.sku(req.params.sku);
          parameters.sku = decodeURIComponent(req.params.sku);
      }
      else if (typeof req.params.name !== 'undefined' && req.params.name != null) {
          parameters.filter_value = req.params.name;
          parameters.filter_type = 'Name';
          parameters.filter = magento.set_filter.name(req.params.name);
      }
      else if (typeof req.params.product_id !== 'undefined' && req.params.product_id != null) {
          parameters.filter_value = req.params.product_id;
          parameters.filter_type = 'Product';
          parameters.filter = magento.set_filter.product_id(req.params.product_id);
          parameters.product_id = req.params.product_id;
      }
      else if (typeof req.params.set !== 'undefined' && req.params.set != null) {
          parameters.filter_value = req.params.set;
          parameters.filter_type = 'Set';
          parameters.filter = magento.set_filter.set(req.params.set);
      }
      else if (typeof req.params.type !== 'undefined' && req.params.type != null) {
          parameters.filter_value = req.params.type;
          parameters.filter_type = 'Type';
          parameters.filter = magento.set_filter.type(req.params.type);
      }

      /* Filter durch URL-Parameter */
      if (typeof req.query['name'] !== 'undefined' && req.query['name'] != null) {
          parameters.filter_value = decodeURIComponent(req.query['name']);
          parameters.filter_type = 'Name';
          parameters.filter = magento.set_filter.name(parameters.filter_value);
      }
      else if (typeof req.query['sku'] !== 'undefined' && req.query['sku'] != null) {
          parameters.filter_value = decodeURIComponent(req.query['sku']);
          parameters.filter_type = 'SKU';
          parameters.filter = magento.set_filter.sku(parameters.filter_value);
          parameters.sku = decodeURIComponent(req.query['sku']);
      }
    }
    return parameters;
  }

  function list_iframe_request (req, res){
    var parameters = render_parameters(req);
  	/* Magentofuntion zum rendern der Seite mit Filter und magento config */
      magento.catalog.product.list(parameters.filter, parameters.storeView, parameters.current_magento_conf, function(error, result) {
      	res.render('product_list', parameters);
      });
  };

  function list_request(req, res){
      var parameters = render_parameters(req);
      res.render('product_list_load', parameters );
  };

  function list_dnode (filter_type, input, shop, storeView, cb) {
    console.log('list_dnode: ' + storeView);

    var filter = null;

    if (filter_type)
      switch (filter_type) {
        case 'Name':
          filter = magento.set_filter.name(input);
          break;
        case 'Product':
          filter = magento.set_filter.product_id(input);
          break;
        case 'SKU':
          filter = magento.set_filter.sku(input);
          break;
        case 'Set':
          filter = magento.set_filter.set(input);
          break;
        case 'Type':
          filter = magento.set_filter.type(input);
          break;
      }
    //console.log(filter);
    /* Magentofuntion zum rendern der Seite mit Filter und magento config */
    magento.catalog.product.list(filter, storeView, magento_confs[shop], function(error, result) {
        var shop_param = url.setShopUrl('', shop);
        app.render('product_list', {title: 'Product List', url: "/product", products: result, shop_param: shop_param, magento_shop: magento_confs[0]  },  function(err, html){
          cb(html);
        });
    });
  }

  function info_compare_request(req, res){
      var parameters = render_parameters(req);
      res.render('product_info_compare_load', parameters );
  };


  function index_request (req, res){
      var parameters = render_parameters(req);
      res.render('product_index',  parameters);
  };

  function index_dnode (cb){
    var parameters = render_parameters(req);
    app.render('product_index', parameters, function(err, html){
     cb(html);
    });
  }

  function info_and_image_request (req, res){
    var parameters = render_parameters(req);
    parameters.title = 'Product Info';
    parameters.url = parameters.url + "/info_with_image/";

  	function render(result_attributes, result_image) {
      var i = 0;
      var attribute_names = new Array();
      for (x in result_attributes) {
        attribute_names[i] = x;
        i++;
      }
      //console.log(result_attributes);
      //console.log(result_image);
      parameters.attribute_values = result_attributes;
      parameters.attribute_names = attribute_names;
      parameters.images = result_image;

  		res.render('product_attributes_image', parameters );
  	}
    magento.catalog.product.info_and_image(req.params.product_id, parameters.storeView, parameters.current_magento_conf, render);
  };

  function info_request (req, res){
      var parameters = render_parameters(req);
      parameters.title = 'Product Info';
      parameters.url = parameters.url + "/info/";

    magento.catalog.product.info(req.params.product_id, parameters.storeView, parameters.current_magento_conf, function(error, result) {
    	if (error) { throw error; }
    	//console.log(result);
    	var i = 0;
    	var attribute_names = new Array();
    	for (x in result) {
    		attribute_names[i] = x;
    		i++;
    	}

      parameters.attribute_values = result;
      parameters.attribute_names = attribute_names;

    	res.render('product_attributes', parameters);
    });
  };
  function info_load_request (req, res){
 
    var parameters = render_parameters(req);
    parameters.title = 'Product Info';
    parameters.url = parameters.url + "/info/";

    res.render('product_attributes_load', parameters);
  };
  function info_dnode (sku_or_id, shop, storeView, cb) {
    var parameters = {};
    parameters.storeView = storeView;
    parameters.current_magento_conf = magento_confs[shop];
    parameters.title = 'Product Info';
    parameters.url = "magento/product/info_with_image/";

    function render(result_attributes, result_image) {
      var i = 0;
      var attribute_names = new Array();
      for (x in result_attributes) {
        attribute_names[i] = x;
        i++;
      }
      //console.log(result_attributes);
      //console.log(result_image);

      parameters.attribute_values = result_attributes;
      parameters.attribute_names = attribute_names;
      parameters.images = result_image;

      app.render('product_attributes_image', parameters, function(err, html){
        cb(html);
      });
    }

    magento.catalog.product.info_and_image(sku_or_id, parameters.storeView, parameters.current_magento_conf, render);

  }

  function image_info_request(req, res){
    var parameters = render_parameters(req);
    parameters.title = 'Product Image Info';
    parameters.url = parameters.url + "/info/image/";

    magento.catalog.product.attribute.media.info(req.params.product_id, parameters.storeView, parameters.current_magento_conf, function(error, result) {
      parameters.images = result;
    	res.render('product_image_info', parameters);
    });
  };

  function delete_request(req, res){
      var parameters = render_parameters(req);
      parameters.title = 'Product Delete';
      res.render('product_delete', parameters);
  };

  function image_request (req, res){
    var parameters = render_parameters(req);
    parameters.title = 'Product Image';
    parameters.url = parameters.url + "/image/";

    magento.catalog.product.attribute.media.list(req.params.product_id, parameters.storeView, parameters.current_magento_conf, function(error, result) {
      parameters.images = result;
    	res.render('product_image_list', parameters);
    });
  };

  function request_store_list(req, res) {
    console.log("render: request_store_list");
    var parameters = render_parameters(req);

    magento.store.list(parameters.current_magento_conf, function(error, result) {
      console.log(result);
    });
  };

  return {
    request: {
        list_iframe: list_iframe_request
      , list: list_request
      , info_compare: info_compare_request
      , index: index_request
      , info: info_request
      , info_load: info_load_request
      , info_and_image: info_and_image_request
      , delete: delete_request
      , image: image_request
      , store: { list: request_store_list }
    },
    dnode: {
        list: list_dnode
      , info: info_dnode
      , index: index_dnode
    }
  }
}