// sublime: tab_size 2; translate_tabs_to_spaces true
var url = require('../public/javascripts/url_funcs.js');
var magento = require('../magento_funcs');
//var download = require('../download_file.js');
var fs = require('fs');
var sync_shops_confs = require('../config/sync_shops.js');
//var get = require('get');
var fetchUrl = require("fetch").fetchUrl;
//var jsdom = require("jsdom");

var product = {};
var render_parameter = {
    title: sync_shops_confs[0].name + ' Sync'
  , sync_shops_confs: sync_shops_confs
  , magento_confs: magento.confs
  , magento_shop: magento.confs[0]
  , sync_shop: sync_shops_confs[0]
  , url: '/' + sync_shops_confs[0].url
};

function get_json(uri, cb) {
  // get(uri).asString(function(err, data) {
  //   if (err) throw err;
  //   parse_html(data)
  // });
  fetchUrl(uri, function(error, meta, body){
      //console.log(body.toString());
      //if(body) {
        var data = JSON.parse(body.toString());
        cb(data);
      //} //TODO body == undefined
  });
}

function index(req, res) {
  res.render('sync_shop_index', render_parameter);
};

product.index = function(req, res) {
  res.render('sync_shop_product_index', render_parameter);
};
//ladet die Seite sobald sie erhältlich ist
product.info = function(req, res) {
  //download.wget(file_uri, './downloads/+sync_shops_confs[0].url+'/product');
  if (req.query['sku']) {
    value = decodeURIComponent(req.query['sku'])
    var url_string = sync_shops_confs[0].host + sync_shops_confs[0].path;
    url_string = url.setParameterUrl(url_string, sync_shops_confs[0].sku_var_name, value);
    url_string = url.setParameterUrl(url_string, sync_shops_confs[0].login, sync_shops_confs[0].pass);
    console.log('url_string: ' + url_string);

    //var product = JSON.parse(get(url_string));
    get_json(url_string, function(data) {
      //console.log(data);
      var parameter = render_parameter;
      parameter.url = "/"+sync_shops_confs[0].url+"/product/";
      parameter.attribute_values = data.DATA;
      parameter.attribute_names = data.COLUMNS;
      parameter.shop_param = '';
      res.render('product_attributes', parameter);
    });

    //console.log(product);
    //index(req, res);
    //
  }
  else {
    console.log('keine sku angegeben!');
    product.index(req, res);
  }
};
//ladet die infos mittels dnode nach sobald sie erhältlich sind, zeigt solange ein loader an
product.info_load = function(req, res) {
  if (req.params.sku != null) {
      res.render('product_attributes_load', { title: sync_shops_confs[0].name, url: "/"+sync_shops_confs[0].url+"/product/", atribute_values: data.DATA, atribute_names: data.COLUMNS, shop_param: '' });
  }
  else {
    console.log('keine sku angegeben!');
    index(req, res);
  }
};




exports.product = product;
exports.index = index;