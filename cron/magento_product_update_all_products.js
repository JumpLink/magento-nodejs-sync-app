// sublime: tab_size 2; translate_tabs_to_spaces true

/**
 * Dieses kleine Script speichert alle Product-Werte eines Shops - welches seine Daten im JSON-Format
 * übergibt - als eigene - vorher angelegte - Attribute in Magento ab.
 */

var url = require('../public/javascripts/url_funcs.js');
var json_shops_confs = require('../config/sync_shops.js');
var json_shop = require('../json_shop_funcs.js');
var magento_confs = require('../config/magento_confs.js');
var magento = require('../magento_funcs');
var util = require('util');
var colors = require('colors');

var filter = null;
var storeView = null;
var shop_index = 0;

function json_product(sku, cb) {
  json_shop.get_products(json_shop.parse_info_filter(sku, null), function(data){
    cb(sku, data);
  });
}

function pausecomp(ms) {
  ms += new Date().getTime();
  while (new Date() < ms){}
} 

function update_products_with_each_new_connect() {
  magento.catalog.product.list(filter, storeView, magento_confs[shop_index], function(error, result) {
    //console.log(result);
    for (var i = result.length - 1; i >= 0; i--) {
      //pausecomp(10);
      var sku = result[i].sku;
      json_product(sku, function(sku, data){
        //console.log(sku);
        if(typeof data != undefined && data.ROWCOUNT>0) {
          //console.log("vwheritage yes");
          json_shop.getProductDataForMagentoAttributes(sku, data, function(sku, magento_attributes){
            //console.log(magento_attributes);
            //console.log('sku: '+sku);
            var storeView = null;
            var shop_index = 0;
            try {
              magento.catalog.product.update(sku, magento_attributes, storeView, magento_confs[shop_index], function(error, sku, result) {
                console.log('product update with sku: '+sku+' result: ');
                console.log(result);
                if (error) { throw error; }
              });
            } catch (error) {
                console.log("Error with sku " + sku + ": ", err)
            }
          });
        }
        else{
          //console.log("vwheritage no");
        }
      });
    }
  });
}

function update_products_with_one_connect() {
  var current_magento = require('../magento')(magento_confs[shop_index]);
  current_magento.init(function(err) {
    current_magento.catalog_product.list(filter, storeView, function(error, result) {
    //console.log(result);
      for (var i = result.length - 1; i >= 0; i--) {
        var sku = result[i].sku;
        json_product(sku, function(sku, data){
          //console.log(sku);
          if(typeof data != undefined && data.ROWCOUNT>0) {
            //console.log("vwheritage yes");
            pausecomp(10);
            json_shop.getProductDataForMagentoAttributes(sku, data, function(sku, magento_attributes){
              //console.log(magento_attributes);
              //console.log('sku: '+sku);
              var storeView = null;
              var shop_index = 0;
              // try {
                current_magento.catalog_product.update(sku, magento_attributes, storeView, function(error, result) {
                  
                  if (error) {util.error('product update with sku: '+sku.blue+' failed: '.red + util.inspect(error));}
                  else {util.log('product update with sku: '+sku.blue+' successful'.green+', result: '+util.inspect(result));}
                  
                  // if (error) { throw error; }
                });
              // } catch (error) {
              //     console.log("Error with sku " + sku + ": ", err)
              // }
            });
          }
          else{
            //console.log("vwheritage no");
          }
        });
      }
    });
  });
}

//update_products_with_each_new_connect();
update_products_with_one_connect();