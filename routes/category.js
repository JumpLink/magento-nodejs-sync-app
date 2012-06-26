// sublime: tab_size 2; translate_tabs_to_spaces true

// var magento = require('../magento_funcs');
// var url = require('../public/javascripts/url_funcs.js');

module.exports = function (app, magento, url, magento_confs, sync_shops_confs) {

  function tree_request (req, res){
  	/* Shop-Config nach URL-Paramter */
  	var magento_conf = url.getURLShop(req, magento);
  	var storeView = null;
      //magento.catalog.category.tree(req, res, req.params.parent_id, null, req.url, magento_conf, url.setShopUrl('', req.query['shop']));

      magento.catalog.category.tree(req.params.parent_id, storeView, magento_conf, function(error, result) {
      	if (error) { throw error; }
      	var shop_param = url.setShopUrl('', req.query['shop']);
      	//res.render('category_tree', { title: 'Category Tree', url: "/category/tree", images: result, shop_param: shop_param });
  		res.render('category_tree', { title: 'Category Tree', url: "/category/tree", parentId: req.params.parent_id, category_of_parentId: result, shop_param: shop_param });
      });
  }

  function level_request (req, res){
  	var magento_conf = url.getURLShop(req, magento);
  	var website = null;
  	var storeView = null;
      //magento.catalog.category.level(req, res, null, null, req.params.parent_id, req.url, magento_conf, url.setShopUrl('', req.query['shop'])) ;

      magento.catalog.category.level(website, storeView, req.params.parent_id, magento_conf, function(error, result) {
      	if (error) { throw error; }
      	var shop_param = url.setShopUrl('', req.query['shop']);
      	//console.log(result);
  		res.render('category_level', { title: 'Category Level', url: "/category/level", shop_param: shop_param, categories: result });
      }); 
  }

  function index_request (req, res){
      res.render('category_index', {title: 'Bugwelder Sync', magento_confs: magento.confs });
  }

  function products_request (req, res){
  	var magento_conf = url.getURLShop(req, magento);
  	var store = null;
      //magento.catalog.category.assignedProducts(req, res, req.params.category_id, null/*store*/, req.url, magento_conf, url.setShopUrl('', req.query['shop'])) ; 

      magento.catalog.category.assignedProducts(req.params.category_id, store, magento_conf, function(error, result) {
      	if (error) { throw error; }
      	var shop_param = url.setShopUrl('', req.query['shop']);
  		res.render('category_product_list', { title: 'Product List', url: "/category/products", products: result, categoryId: req.params.category_id, shop_param: shop_param });    	
      });
  }

  return {
    request: {
        tree: tree_request
      , level: level_request
      , index: index_request
      , products: products_request
    },
    dnode: {

    }
  }

}