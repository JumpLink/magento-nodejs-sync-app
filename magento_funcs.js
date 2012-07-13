var confs = require('./config/magento_confs.js');
module.exports.confs = confs;

function getConfByNameVersion (confs, string) {
  for (var k=0; k<confs.length; k++) {
    //console.log('string ' + string + ' confstring: ' + confs[k].name + ' ' + confs[k].shop_version);
    if(string == confs[k].name + ' ' + confs[k].shop_version)
      return confs[k];
  }
  return confs[0];
}
module.exports.getConfByNameVersion = getConfByNameVersion;
/*
 * http://www.magentocommerce.com/wiki/1_-_installation_and_configuration/using_collections_in_magento
 * Definiert einen Filter
 */
var set_filter = {
  sku: function(sku) {
    var filters = {
        sku: {
          qe: sku
        }
      }
    return filters
  },
  product_id: function(product_id) {
    var filters = {
        product_id: {
          qe: product_id
        }
      }
    return filters
  },
  name: function(name) {
    var filters = {
        name: {
          qe: name
        }
      }
    return filters
  },
  set: function(set) {
    var filters = {
        set: {
          qe: set
        }
      }
    return filters
  },
  type: function(type) {
    var filters = {
        type: {
          qe: type
        }
      }
    return filters
  }
}

module.exports.set_filter = set_filter;

var
catalog = {
  category: {
    level: function(website, storeView ,parentCategory, conf, cb) {
      var magento = require('./magento')(conf),
        util = require('util');

      magento.init(function(err) {
        magento.catalog_category.level(website, storeView ,parentCategory, cb);
      });
    },
    /* http://www.magentocommerce.com/wiki/doc/webservices-api/catalog_category#catalog_category.tree */
    tree: function(parentId, storeView, conf, cb) {
      var magento = require('./magento')(conf),
        util = require('util');

      magento.init(function(err) {
        magento.catalog_category.tree(parentId, storeView, cb);
      });
    },
    /* http://www.magentocommerce.com/wiki/doc/webservices-api/catalog_category#catalog_category.assignedproducts */
    assignedProducts: function(categoryId, store, conf, cb) {
      var magento = require('./magento')(conf);
      var util = require('util');

      magento.init(function(err) {
        magento.catalog_category.assignedProducts(categoryId, store, cb);
      });
    }
  },
  product: {
    list: function(filters, storeView, conf, cb) {
      var magento = require('./magento')(conf);
      var util = require('util');

      magento.init(function(err) {
        magento.catalog_product.list(filters, storeView, cb);
      });

    },
    /* http://www.magentocommerce.com/wiki/doc/webservices-api/api/catalog_product#catalog_product.info */
    info: function(product_id_or_sku, storeView, conf, cb) {
      var magento = require('./magento')(conf);
      var util = require('util');

      magento.init(function(err) {
        magento.catalog_product.info(product_id_or_sku, storeView, cb);
      });

    },
    info_and_image: function(product_id_or_sku, storeView, conf, cb_render) {
      // console.log(product_id_or_sku);
      // console.log(storeView);
      // console.log(conf);
      var magento = require('./magento')(conf);

      magento.init(function(err) {
        magento.catalog_product.info(product_id_or_sku, storeView, function(error, result_attributes) {
          if (error) { throw error; }
          magento.catalog_product_attribute_media.list(product_id_or_sku, storeView, function(error, result_image) {
            if (error) { throw error; }
            cb_render(result_attributes, result_image);
          });
        }); 
        
      });

    },
    update: function(product_id_or_sku, productData, storeView, conf, cb_render) {
      // console.log(product_id_or_sku);
      // console.log(productData);
      // console.log(storeView);
      // console.log(conf);
      var magento = require('./magento')(conf);
      var product_id_or_sku = product_id_or_sku;
      magento.init(function(err) {
        magento.catalog_product.update(product_id_or_sku, productData, storeView, function(error, result) {
          //if (error) { throw error; }
          //console.log("updated sku: "+product_id_or_sku);
          cb_render(error, product_id_or_sku, result);
        }); 
      });
    },
    attribute: {
      media: {
        /* http://www.magentocommerce.com/wiki/doc/webservices-api/api/catalog_product_attribute_media#catalog_product_attribute_media.list */
        list: function(product_id, storeView, conf, cb) {
          var magento = require('./magento')(conf);
          var util = require('util');

          magento.init(function(err) {
            magento.catalog_product_attribute_media.list(product_id, storeView, cb);
          });

        },
        /* http://www.magentocommerce.com/wiki/doc/webservices-api/api/catalog_product_attribute_media#catalog_product_attribute_media.info */
        info: function(product_id, storeView, conf, cb) {
          var magento = require('./magento')(conf);
          var util = require('util');

          magento.init(function(err) {
            magento.catalog_product_attribute_media.info(product_id, storeView,  cb);
          });

        }
      }
    }
  }
}

var
store = {
  list: function(conf, cb) {
    var magento = require('./magento')(conf),
      util = require('util');

    magento.init(function(err) {
      magento.core_magento.info(cb);
    });
  }
}

module.exports.catalog = catalog;
module.exports.store = store;