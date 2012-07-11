// sublime: tab_size 2; translate_tabs_to_spaces true
// var magento = require('../magento_funcs');
// var url = require('../public/javascripts/url_funcs.js');
// var magento_confs = require('../config/magento_confs.js');
// var sync_shops_confs = require('../config/sync_shops.js');
module.exports = function (app, magento, url, magento_confs, sync_shops_confs) {

  function render_parameters(req) {
    var parameters = {};
    parameters.title = 'Bugwelder Sync';
    parameters.url = '' ;
    parameters.sync_shop = sync_shops_confs[0];
    parameters.magento_confs = magento_confs;
    parameters.magento_shop = magento_confs[0];

    if (!(typeof req === 'undefined' || typeof req.query === 'undefined')) {
      console.log(req);

      parameters.storeView = url.getURLStoreView(req);
      parameters.current_magento_conf = url.getURLStoreView(req);

      if (typeof req.query['shop'] === 'undefined')
        console.log('req.query[shop] is undefined');
      else
        parameters.shop_param = url.setShopUrl('', req.query['shop']);

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

      /* Filter urch URL-Parameter */
      if (req.query['name']) {
       var filter_value = decodeURIComponent(req.query['name']);
       parameters.filter = magento.set_filter.name(filter_value);
       console.log('name: ' + filter_value);
      }
      else if (req.query['sku']) {
       var filter_value = decodeURIComponent(req.query['sku']);
       parameters.filter = magento.set_filter.sku(filter_value);
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
      var parameters = render_parameters(req);
      parameters.filter_type = type;
      parameters.filter_value = value;
      parameters.filter_shop = shop;
      parameters.storeView = url.getURLStoreView(req);
      if (req.query['shop'] != null)
        parameters.shop_param = url.setShopUrl('', req.query['shop']);

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
     // var magento_conf = url.getURLShop(req, magento);
      var parameters = render_parameters(req);
      parameters.sku = decodeURIComponent(req.query['sku']);
      if (req.query['shop'] != null) {
          parameters.filter_shop = decodeURIComponent(req.query['shop']);
          parameters.shop_param = url.setShopUrl('', req.query['shop']);
      }

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
  	var magento_conf = url.getURLShop(req, magento);
  	var storeView = getURLStoreView(req);

  	function render(result_attributes, result_image) {
  		var i = 0;
      	var attribute_names = new Array();
      	for (x in result_attributes) {
      		attribute_names[i] = x;
      		i++;
      	}
      	console.log(result_attributes);
      	console.log(result_image);
      var parameter = render_parameters(req);
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

  function info_request (req, res){
  	var magento_conf = url.getURLShop(req, magento);
  	var storeView = getURLStoreView(req);

      magento.catalog.product.info(req.params.product_id, storeView, magento_conf, function(error, result) {
      	if (error) { throw error; }
      	//console.log(result);
      	var i = 0;
      	var attribute_names = new Array();
      	for (x in result) {
      		attribute_names[i] = x;
      		i++;
      	}

        var parameter = render_parameters(req);
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
  function info_load_request (req, res){
    var magento_conf = url.getURLShop(req, magento);
 
    var parameter = render_parameters(req);
    parameter.title = 'Product Info';
    parameter.url = "/product/info/";
    parameter.product_id = req.params.product_id;
    parameter.sync_shop = sync_shops_confs[0];
    parameter.shop_nr = req.query['shop'];

    res.render('product_attributes_load', parameter);
  };
  function info_dnode (sku_or_id, shop, storeView, cb) {

    var magento_conf = magento_confs[shop];

    function render(result_attributes, result_image) {
      var i = 0;
      var attribute_names = new Array();
      for (x in result_attributes) {
        attribute_names[i] = x;
        i++;
      }
      console.log(result_attributes);
      console.log(result_image);
      var parameter = {};
      parameter.title = 'Product Info';
      parameter.url = "product/info_with_image/";
      parameter.attribute_values = result_attributes;
      parameter.attribute_names = attribute_names;
      parameter.images = result_image;

      app.render('product_attributes_image', parameter, function(err, html){
        cb(html);
      });
    }

    magento.catalog.product.info_and_image(sku_or_id, storeView, magento_conf, render);

  }

  function image_info_request(req, res){
  	var magento_conf = url.getURLShop(req, magento);
  	var storeView = getURLStoreView(req);

      magento.catalog.product.attribute.media.info(req.params.product_id, storeView, magento_conf, function(error, result) {

        var parameter = render_parameters(req);
        parameter.title = 'Product Image Info';
        parameter.url = "/product/info/image/";
        parameter.images = result;
        if (req.query['shop'] != null)
          parameter.shop_param = url.setShopUrl('', req.query['shop']);

      	res.render('product_image_info', parameter);
      });
  };

  function delete_request(req, res){
      var magento_conf = url.getURLShop(req, magento);

      // magento.catalog.product.attribute.media.info(req.params.product_id, magento_conf, function(error, result) {
      //     var shop_param = url.setShopUrl('', req.query['shop']);
      //     res.render('product_delete', { title: 'Product Delete', url: "/product/delete/", product: result, shop_param: shop_param });
      // });
      var parameter = render_parameters(req);
      parameter.title = 'Product Delete';
      if (req.query['shop'] != null)
        parameter.shop_param = url.setShopUrl('', req.query['shop']);

      res.render('product_delete', parameter);
  };

  function image_request (req, res){
  	var magento_conf = url.getURLShop(req, magento);
  	var storeView = getURLStoreView(req);

      magento.catalog.product.attribute.media.list(req.params.product_id, storeView, magento_conf, function(error, result) {

        var parameter = render_parameters(req);
        parameter.title = 'Product Image';
        parameter.url = "/product/image/";
        parameter.images = result;
        if (req.query['shop'] != null)
          parameter.shop_param = url.setShopUrl('', req.query['shop']);

      	res.render('product_image_list', parameter);
      });
  };

  function request_store_list(req, res) {
    console.log("render: request_store_list");
    var magento_conf = url.getURLShop(req, magento);
    var parameter = render_parameters(req);
    magento.store.list(magento_conf, function(error, result) {
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