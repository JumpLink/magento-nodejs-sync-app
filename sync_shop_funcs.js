// sublime: tab_size 2; translate_tabs_to_spaces true
var sync_shops_confs = require('./config/sync_shops.js');
var url = require('./public/javascripts/url_funcs.js');
var fetchUrl = require("fetch").fetchUrl;
var magento = require('./magento_funcs');

var render_parameter = {
    title: sync_shops_confs[0].name + ' Sync'
  , sync_shops_confs: sync_shops_confs
  , magento_confs: magento.confs
  , magento_shop: magento.confs[0]
  , sync_shop: sync_shops_confs[0]
  , sync_shop_url: "/"+sync_shops_confs[0].url
  , filter_shop: 0 //TODO
};

function get_json(uri, cb) {
  fetchUrl(uri, function(error, meta, body){
      //console.log(body.toString());
      if(typeof body != 'undefined') {
        var data = JSON.parse(body.toString());
        cb(data);
      } else {
        cb(null);
      }
  });
}

function parse_info_filter(sku, cb) {
  
  value = decodeURIComponent(sku)
  var url_string = sync_shops_confs[0].host + sync_shops_confs[0].path;
  url_string = url.setParameterUrl(url_string, sync_shops_confs[0].sku_var_name, value);
  url_string = url.setParameterUrl(url_string, sync_shops_confs[0].login, sync_shops_confs[0].pass);
  //console.log('url_string: ' + url_string);
  url_string = encodeURIComponent(url_string);
  if(cb != null)
    cb(url_string);
  else
    return url_string;
}

function set_render_parameter(data, cb) {
  var parameter = render_parameter;
      parameter.url = "/"+sync_shops_confs[0].url+"/product/";
      parameter.attribute_values = data.DATA;
      parameter.attribute_names = data.COLUMNS;
      parameter.shop_param = '';
  if(typeof cb != undefined)
    cb(parameter);
  else
    return parameter;
}

function get_products(url_string, cb) {
  url_string = decodeURIComponent(url_string);
  get_json(url_string, function(data) {
    if(data != null) {
      //console.log(data);
      if(typeof cb != undefined)
        cb(data);
      else
        return data;
    } else {
      //error.e408(req, res); TODO
    }
  });
}

exports.parse_info_filter = parse_info_filter;
exports.render_parameter = render_parameter;
exports.set_render_parameter = set_render_parameter;
exports.get_products = get_products;