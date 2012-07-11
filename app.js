// sublime: tab_size 2; translate_tabs_to_spaces true

var express = require('express')
  , app = express()
  , routes = require('./routes/routes.js')(app)
  , dnode = require('dnode')({ routes: routes.dnode })
  , http = require('http')
  , json_shop_confs = require('./config/sync_shops.js')
  , magento_shop_confs = require('./config/magento_confs.js')
  , http_server = http.createServer(app)
  , Iconv = require('iconv')//.Iconv
  ;

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
app.get('/dnode.js', function (res, req, next) { });
app.get('/'+magento_shop_confs[0].url, routes.request.index);
app.get('/'+magento_shop_confs[0].url+'/product', routes.request.product.index);
app.get('/'+magento_shop_confs[0].url+'/product/list', routes.request.product.list);
app.get('/'+magento_shop_confs[0].url+'/product/name/:name', routes.request.product.list);
app.get('/'+magento_shop_confs[0].url+'/product/sku/:sku', routes.request.product.list);
app.get('/'+magento_shop_confs[0].url+'/product/product_id/:product_id', routes.request.product.list);
app.get('/'+magento_shop_confs[0].url+'/product/set/:set', routes.request.product.list);
app.get('/'+magento_shop_confs[0].url+'/product/type/:type', routes.request.product.list);
app.get('/'+magento_shop_confs[0].url+'/product/info_compare', routes.request.product.info_compare);
app.get('/'+magento_shop_confs[0].url+'/product/info/:product_id', routes.request.product.info_load);
app.get('/'+magento_shop_confs[0].url+'/shop/list', routes.request.product.store.list);
app.get('/'+json_shop_confs[0].url, routes.request.sync_shop.index);
app.get('/'+json_shop_confs[0].url+'/product', routes.request.sync_shop.product.info);
app.get('/'+json_shop_confs[0].url+'/product/list', routes.request.sync_shop.partnums.index_load);
app.get('/'+json_shop_confs[0].url+'/product/info', routes.request.sync_shop.product.info_load);

// catches the sites they need a style=is_iframe prameter 
app.get('^\/$|^'+'\/'+magento_shop_confs[0].url+'\/category*$|^'+'\/'+magento_shop_confs[0].url+'\/customer*$|^'+'\/'+magento_shop_confs[0].url+'\/product/*$|^\/'+json_shop_confs[0].url+'*$', routes.request.iframe);
// all the following sites with style=is_iframe prameter 
app.get('/'+magento_shop_confs[0].url+'/category', routes.request.category.index);
app.get('/'+magento_shop_confs[0].url+'/category/tree/:parent_id', routes.request.category.tree);
app.get('/'+magento_shop_confs[0].url+'/category/level/:parent_id', routes.request.category.level);
app.get('/'+magento_shop_confs[0].url+'/category/products/:category_id', routes.request.category.products);
app.get('/'+magento_shop_confs[0].url+'/customer', routes.request.customer.index);
app.get('/'+magento_shop_confs[0].url+'/product/new/:product_id', routes.request.product.new);
app.get('/'+magento_shop_confs[0].url+'/product/update/:product_id', routes.request.product.update);
app.get('/'+magento_shop_confs[0].url+'/product/sync/:product_id', routes.request.product.sync);
app.get('/'+magento_shop_confs[0].url+'/product/delete/:product_id', routes.request.product.delete);
app.get('/'+magento_shop_confs[0].url+'/product/info_with_image/:product_id', routes.request.product.info_and_image);
app.get('/'+magento_shop_confs[0].url+'/product/image/:product_id', routes.request.product.image);
app.get('/'+magento_shop_confs[0].url+'/product/info/image/:product_id', routes.request.product.image_info);


dnode.listen(http_server);

http_server.listen(app.get('port'), '127.0.0.1', function() {
  console.log("Express server listening on port " + app.get('port'));
});
