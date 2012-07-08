// sublime: tab_size 2; translate_tabs_to_spaces true

module.exports = function (app, magento, url, magento_confs, sync_shops_confs) {

  var   fs = require('fs')
      , json_shop = require('../json_shop_funcs.js')
      , request = {product: {}, partnums: {}}
      , dnode = {product:{}, partnums: {}}
      , render_parameter = json_shop.render_parameter
      ;

  // error.e408 = function (req, res) {
  //   res.render('408', render_parameter);
  // }

  request.index = function index (req, res) {
    res.render('sync_shop_index', render_parameter);
  };

  request.product.index = function(req, res) {
    res.render('sync_shop_product_index', render_parameter);
  };

  //ladet die Seite sobald sie erhältlich ist
  request.product.info = function(req, res) {
    if (req.query['sku']) {
      var type = 'SKU';
      json_shop.parse_info_filter(req.query['sku'], function(url_string){
        json_shop.get_products(url_string, function(data){
          json_shop.set_render_parameter(data, function(parameter){
            if (data.ROWCOUNT>0)
              res.render('product_attributes', parameter);
            else
              res.render('no_product_with_menu', parameter);
          });
        });
      });
    } else {
      //console.log('no sku given!');
      request.product.index(req, res);
    }
  };

  dnode.product.info = function (get_product_url, cb) {
    //console.log('dnode get_product_url:' + get_product_url);
    var sync_shop = require('../sync_shop_funcs.js');
    json_shop.get_products(get_product_url, function(data){
      if(typeof data != undefined)
        json_shop.set_render_parameter(data, function(parameter){
          if (data.ROWCOUNT>0)
            app.render('product_attributes', parameter, function(err, html){
              cb(html);
            });
          else
            app.render('no_product', parameter, function(err, html){
              cb(html);
            });
        });
      else
        app.render('408', render_parameter, function(err, html){
          cb(html);
        });
    });
  };

  dnode.product.info_by_sku = function (sku, cb) {
    //console.log('dnode get_product_url:' + get_product_url);
    var get_product_url = json_shop.parse_info_filter(sku, null);
    dnode.product.info(get_product_url, cb)
  };

  //ladet die infos mittels dnode nach sobald sie erhältlich sind, zeigt solange ein loader an
  request.product.info_load = function(req, res) {
    if (req.query['sku']) {
      var type = 'SKU';
      json_shop.parse_info_filter(req.query['sku'], function(url_string){
        var parameter = render_parameter;
            parameter.get_product_url = url_string; 
        res.render('sync_shop_product_attributes_load', parameter);
      });
    } else {
      console.log('no sku given!');
      product.index(req, res);
    }
  };

  dnode.partnums.index = function (cb) {
    //console.log('dnode get_product_url:' + get_product_url);
    var json_shop = require('../json_shop_funcs.js');
    json_shop.get_partnums_url(function(url_string){
      url_string = decodeURIComponent(url_string)
      json_shop.get_json(url_string, function(data){
        //console.log(data);
        if(typeof data != undefined) {
          json_shop.set_render_parameter(data, function(parameter){
            if (data.ROWCOUNT>0)
              app.render('json_shop_partnums', parameter, function(err, html){
                cb(html);
              });
            else
            app.render('408', render_parameter, function(err, html){
              cb(html);
            });
          });
        }
        else
          app.render('408', render_parameter, function(err, html){
            cb(html);
          });
      });
    });
  };

  request.partnums.index_load = function(req, res) {
    json_shop.get_partnums_url(function(url_string){
      var parameter = render_parameter;
      res.render('json_shop_partnums_load', parameter);
    });
  };

  return {
      request: request
    , dnode: dnode
  }

}
