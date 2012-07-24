// sublime: tab_size 2; translate_tabs_to_spaces true

/**
 * Dieses kleine Script speichert alle Product-Werte eines Shops - welches seine Daten im JSON-Format
 * übergibt - als eigene - vorher angelegte - Attribute in Magento ab.
 */

var url = require('../public/javascripts/url_funcs.js');
var magento_confs = require('../config/magento_confs.js');
var magento = require('../magento_funcs');
var util = require('util');
var argv = require('optimist').argv;
//var colors = require('colors');

var Log = require('log')
  , fs = require('fs')
  , stream_sku = fs.createWriteStream(__dirname + '/failed_skus.log', { flags: 'a' })
  , stream_err = fs.createWriteStream(__dirname + '/error.log', { flags: 'a' })
  , log_sku = new Log('debug', stream_sku)
  , log_err = new Log('debug', stream_err);

var storeView = null;
var website = null;
var shop_index_base = 0;
var shop_index_update = 1;
var start_categorie = 1;
var attributes = null;
if (argv.base) {
    shop_index_base = argv.base;
}
if (argv.update) {
    shop_index_update = argv.update;
}
if (argv.start) {
    start_categorie = argv.start;
}
var base_magento = require('../magento')(magento_confs[shop_index_base]);
var update_magento = require('../magento')(magento_confs[shop_index_update]);

function pausecomp(ms) {
  ms += new Date().getTime();
  while (new Date() < ms){}
}



function delete_categorie(category_id) {
  update_magento.init(function(err) {
    update_magento.catalog_category.delete(category_id, function(error, result) {
      if(error) {
        console.log(error);
      }
      else {
        console.log("categorie deleted")
      }
    });
  });
}

function create_categorie(categoryData) {
  if(categoryData.default_sort_by == null) {
    categoryData.available_sort_by = ['name'];
    categoryData.default_sort_by = 'name';
  }
  //update_magento.init(function(err) {
    update_magento.catalog_category.create(categoryData.parent_id, categoryData, storeView, function(error, result) {
      if(error) {
        console.log("create_categorie error with category: "+categoryData.category_id+ " "+categoryData.name);
        console.log(error);
        //pausecomp(10000);
        //create_categorie(categoryData);
      }
      else {console.log("categorie created")}
    });
  //});
}

function update_categorie(categoryData) {
  //var parent_id = categoryData.parent_id;
  //delete categoryData.category_id;
  //update_magento.init(function(err) {
    update_magento.catalog_category.update(categoryData.category_id, categoryData, storeView, function(error, result) {
      if(error) {
        console.log("update_categorie error with category: "+categoryData.category_id+ " "+categoryData.name);
        console.log(error);
        //pausecomp(10000);
        //update_categorie(categoryData);
      }
      else {console.log("categorie updated")}
    });
  //});
}

function update_or_create(categoryData) {
  var categoryData = categoryData;
  //delete categoryData.all_children;
  //delete categoryData.children;
  //delete categoryData.children_count;
  delete categoryData.updated_at;
  delete categoryData.created_at;
  if(categoryData.default_sort_by == null) {
    categoryData.available_sort_by = ['name'];
    categoryData.default_sort_by = 'name';
  }
  if (categoryData.is_active == null) {
    categoryData.is_active = 0;
  }
  //update_magento.init(function(err) {
    update_magento.catalog_category.info(categoryData.category_id, storeView, attributes, function(error, result) {
      if(error) {
        console.log("create");
        create_categorie(categoryData);
      }
      else {
        if(typeof(result)!== "undefined" && result != null) {
          console.log("update");
          //console.log(result);
          update_categorie(categoryData);
        }
        else {
          console.log("create");
          create_categorie(categoryData);
        }
      }
    });
  //});
}

function getCategorie(category_id) {
  base_magento.catalog_category.info(category_id, storeView, attributes, function(error, result) {

    if (error) {
      console.log("getCategorie error with category_id: "+category_id);
      console.log(error);
    }
    else {
      var children = result.children.split(',');
      //pausecomp(10000);
      //console.log(result);
      update_or_create(result);
      for (var i = children.length - 1; i >= 0; i--) {
        //console.log(children[i]);
        if(children[i] != null && children[i] != "" &&  children[i] != " ")
          getCategorie(Number(children[i]));
        else {
          //console.log('wrong child?!');
          //console.log(result);
        }
      }
    }
  });
}

function sync_categories(category_id) {
  base_magento.init(function(err) {
    update_magento.init(function(err) {
      getCategorie(category_id);
    });
  });
}

sync_categories(start_categorie);