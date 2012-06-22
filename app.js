// sublime: tab_size 2; translate_tabs_to_spaces true
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , category = require('./routes/category')
  , customer = require('./routes/customer')
  , product = require('./routes/product')
  , sync_shop = require('./routes/sync_shop')
  , error = require('./routes/error')
  , http = require('http')
  , sync_shops_confs = require('./config/sync_shops.js');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 4242);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

//dnode sites/ressources and express-sites without style=is_iframe prameter 
app.get('/dnode.js', function (res, req, next) {

});
app.get('/', routes.index);
app.get('/product', product.index);
app.get('/product/list', product.list);
app.get('/product/name/:name', product.list);
app.get('/product/sku/:sku', product.list);
app.get('/product/product_id/:product_id', product.list);
app.get('/product/set/:set', product.list);
app.get('/product/type/:type', product.list);
app.get('/'+sync_shops_confs[0].url, sync_shop.index);
app.get('/'+sync_shops_confs[0].url+'/product', sync_shop.product.info);
//app.get('/'+sync_shops_confs[0].url+'/product/list', sync_shop.product.info);
app.get('/'+sync_shops_confs[0].url+'/product/list', sync_shop.product.info_load);

// catches the sites they need a style=is_iframe prameter 
app.get('^\/$|^\/category*$|^\/customer*$|^\/product/*$|^\/'+sync_shops_confs[0].url+'*$', routes.iframe);
// all the following sites with style=is_iframe prameter 
app.get('/category', category.index);
app.get('/category/tree/:parent_id', category.tree);
app.get('/category/level/:parent_id', category.level);
app.get('/category/products/:category_id', category.products);
app.get('/customer', customer.index);
app.get('/product/new/:product_id', product.new);
app.get('/product/update/:product_id', product.update);
app.get('/product/sync/:product_id', product.sync);
app.get('/product/delete/:product_id', product.delete);
app.get('/product/info/:product_id', product.info);
app.get('/product/info_with_image/:product_id', product.info_and_image);
app.get('/product/image/:product_id', product.image);
app.get('/product/info/image/:product_id', product.image_info);

var http_server = http.createServer(app);

//dnode
var dnode = require('dnode');
//var dnode_server = dnode(require('./dnode_funcs'));
var magento = require('./magento_funcs');
var magento_confs = require('./config/magento_confs.js');
var url = require('./public/javascripts/url_funcs.js');


function sync_product_info (get_product_url, cb) {
  //console.log('dnode get_product_url:' + get_product_url);
  var sync_shop = require('./sync_shop_funcs.js');
  sync_shop.get_products(get_product_url, function(data){
    if(typeof data != undefined)
      sync_shop.set_render_parameter(data, function(parameter){
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

dnode_server = dnode({
    index: function (cb) {
      app.render('index', {title: magento_confs[0].name + ' Sync' }, function(err, html){
         cb(html);
      });
    },
    product_list: function (filter_type, input, shop, cb) {

      var storeView = null;
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
      console.log(filter);
      /* Magentofuntion zum rendern der Seite mit Filter und magento config */
      magento.catalog.product.list(filter, storeView, magento_confs[shop], function(error, result) {
          var shop_param = url.setShopUrl('', shop);
          app.render('product_list', {title: 'Product List', url: "/product", products: result, shop_param: shop_param, magento_shop: magento_confs[0]  },  function(err, html){
            cb(html);
          });
      });
    },
    loading: function (cb) {
      console.log('loading..');
      app.render('loading', function(err, html){
        console.log(html);
        cb(html);
      });
    },
    sync_product_info: sync_product_info,
    sync_product_info_by_sku: function (sku, cb) {
      var sync_shop = require('./sync_shop_funcs.js');
      var get_product_url = sync_shop.parse_info_filter(sku, null);
      sync_product_info(get_product_url, cb);
    },
});

dnode_server.listen(http_server);

//http
http_server.listen(app.get('port'), '127.0.0.1', function() {
  console.log("Express server listening on port " + app.get('port'));
});
