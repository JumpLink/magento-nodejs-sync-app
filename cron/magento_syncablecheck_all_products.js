var url = require('../public/javascripts/url_funcs.js');
var json_shops_confs = require('../config/sync_shops.js');
var json_shop = require('../json_shop_funcs.js');
var magento_confs = require('../config/magento_confs.js');
var magento = require('../magento_funcs');
var util = require('util');
//var Sync = require('sync');

var config = require(__dirname+'/../config/config.js');
var general_conf = config.open(__dirname + "/../config/general.json");

var email   = require("emailjs");
var email_server  = email.server.connect(general_conf.email);

var filter = null;
var storeView = null;
var shop_index = 0;

function json_product(sku, i, cb) {
  json_shop.get_products(json_shop.parse_info_filter(sku, null), function(data){
    cb(sku, i, data);
  });
}

function check_products_syncable(cb) {
  //console.log("looking for unsyncable skus..");
  var current_magento = require('../magento')(magento_confs[shop_index]);
  current_magento.init(function(err) {
    current_magento.catalog_product.list(filter, storeView, function(error, result) {
      for (var i = 6 - 1; i >= 0; i--) {
        var magento_result = result[i];
        if(magento_result.vwheritage_sync=1) {
          json_product(magento_result.sku, i, function(sku, i, data){
            if(typeof data !== "undefined" && data.ROWCOUNT>0) {

            }
            else{
              //json-shop has not the same itemnumber
              //unavable_skus += sku + "\n";
              //console.log(i)
              console.log(sku);
            }
          });
        }
      }
    });
  });
}

//var unavable_skus = "";
check_products_syncable();
//send_mail();