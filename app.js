// sublime: tab_size 2; translate_tabs_to_spaces true
/**
 * Module dependencies.
 */

var express = require('express')
  , app = express()
  , routes = require('./routes/routes.js')(app)
  //, category = require('./routes/category')
  //, customer = require('./routes/customer')
  //, product = require('./routes/product')
  //, sync_shop = require('./routes/sync_shop')
  //, error = require('./routes/error')
  , http = require('http')
  , sync_shops_confs = require('./config/sync_shops.js');

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
app.get('/', routes.request.index);
app.get('/product', routes.request.product.index);
app.get('/product/list', routes.request.product.list);
app.get('/product/name/:name', routes.request.product.list);
app.get('/product/sku/:sku', routes.request.product.list);
app.get('/product/product_id/:product_id', routes.request.product.list);
app.get('/product/set/:set', routes.request.product.list);
app.get('/product/type/:type', routes.request.product.list);
app.get('/product/info_compare', routes.request.product.info_compare);
app.get('/'+sync_shops_confs[0].url, routes.request.sync_shop.index);
app.get('/'+sync_shops_confs[0].url+'/product', routes.request.sync_shop.product.info);
//app.get('/'+sync_shops_confs[0].url+'/product/list', sync_shop.product.info);
app.get('/'+sync_shops_confs[0].url+'/product/list', routes.request.sync_shop.product.info_load);

// catches the sites they need a style=is_iframe prameter 
app.get('^\/$|^\/category*$|^\/customer*$|^\/product/*$|^\/'+sync_shops_confs[0].url+'*$', routes.request.iframe);
// all the following sites with style=is_iframe prameter 
app.get('/category', routes.request.category.index);
app.get('/category/tree/:parent_id', routes.request.category.tree);
app.get('/category/level/:parent_id', routes.request.category.level);
app.get('/category/products/:category_id', routes.request.category.products);
app.get('/customer', routes.request.customer.index);
app.get('/product/new/:product_id', routes.request.product.new);
app.get('/product/update/:product_id', routes.request.product.update);
app.get('/product/sync/:product_id', routes.request.product.sync);
app.get('/product/delete/:product_id', routes.request.product.delete);
app.get('/product/info/:product_id', routes.request.product.info);
app.get('/product/info_with_image/:product_id', routes.request.product.info_and_image);
app.get('/product/image/:product_id', routes.request.product.image);
app.get('/product/info/image/:product_id', routes.request.product.image_info);

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
    index: routes.dnode.index,
    product_list: routes.dnode.product.list,
    loading: routes.dnode.product.loading,
    sync_product_info: sync_product_info,
    sync_product_info_by_sku: function (sku, cb) {
      var sync_shop = require('./sync_shop_funcs.js');
      var get_product_url = sync_shop.parse_info_filter(sku, null);
      sync_product_info(get_product_url, cb);
    },
    magento_product_info: routes.dnode.product.info,
});

dnode_server.listen(http_server);

//http
http_server.listen(app.get('port'), '127.0.0.1', function() {
  console.log("Express server listening on port " + app.get('port'));
});
