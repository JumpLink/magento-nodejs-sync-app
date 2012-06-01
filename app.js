
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , category = require('./routes/category')
  , customer = require('./routes/customer')
  , product = require('./routes/product')
  , sync_shop = require('./routes/sync_shop')
  , http = require('http')
  , sync_shops_confs = require('./config/sync_shops.js');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
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

app.get('^\/$|^\/category*$|^\/customer*$|^\/product*$|^\/'+sync_shops_confs[0].url+'*$', routes.menu);
app.get('/', routes.index);
app.get('/category', category.index);
app.get('/category/tree/:parent_id', category.tree);
app.get('/category/level/:parent_id', category.level);
app.get('/category/products/:category_id', category.products);
app.get('/customer', customer.index);
app.get('/product/info/:product_id', product.info);
app.get('/product/info_with_image/:product_id', product.info_and_image);
app.get('/product/image/:product_id', product.image);
app.get('/product/info/image/:product_id', product.image_info);
app.get('/product/name/:name', product.list);
app.get('/product/sku/:sku', product.list);
app.get('/product/product_id/:product_id', product.list);
app.get('/product/set/:set', product.list);
app.get('/product/type/:type', product.list);
app.get('/product/list', product.list);
app.get('/product', product.index);
app.get('/'+sync_shops_confs[0].url, sync_shop.index);
app.get('/'+sync_shops_confs[0].url+'/product', sync_shop.product);


http.createServer(app).listen(app.get('port'), function() {
  console.log("Express server listening on port " + app.get('port'));
});


