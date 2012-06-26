// sublime: tab_size 2; translate_tabs_to_spaces true

module.exports = function (app) {

  var url = require('../public/javascripts/url_funcs.js');
  var sync_shops_confs = require('../config/sync_shops.js');
  var magento_confs = require('../config/magento_confs.js');
  var magento = require('../magento_funcs');

  function index_request(req, res) {
     res.render('index', {title: magento_confs[0].name + ' Sync', magento_shop: magento_confs[0], sync_shop: sync_shops_confs[0] });
  }

  function index_dnode (cb) {
    app.render('index', {title: magento_confs[0].name + ' Sync' }, function(err, html){
       cb(html);
    });
  }

  function loading_request (req, res) {
      res.render('loading', {});
  }

  function loading_dnode (cb) {
    //console.log('loading..');
    app.render('loading', function(err, html){
      console.log(html);
      cb(html);
    });
  }

  function iframe_request(req, res, next) {
  	if (url.is_iframe(req, res)) {
  		next();
  	} else {
  		console.log('Menu aufgerufen');
  		res.render('iframe', { title: magento_confs[0].name + ' Sync',  iframe_url: url.setIframeUrl(req.url), sync_shop: sync_shops_confs[0],  magento_shop: magento_confs[0] });
  	}
  }

  return {
    request: {
        index: index_request
      , iframe: iframe_request
      , loading: loading_request
      , product: require('./product.js')(app, magento, url, magento_confs, sync_shops_confs).request
      , category: require('./category.js')(app, magento, url, magento_confs, sync_shops_confs).request
      , customer: require('./customer.js')(app, magento, url, magento_confs, sync_shops_confs).request
      , error: require('./error.js')(app, magento, url, magento_confs, sync_shops_confs).request
      , sync_shop: require('./sync_shop.js')(app, magento, url, magento_confs, sync_shops_confs).request
    },
    dnode: {
        index: index_dnode
      , loading: loading_dnode
      , product: require('./product.js')(app, magento, url, magento_confs, sync_shops_confs).dnode
      , category: require('./category.js')(app, magento, url, magento_confs, sync_shops_confs).dnode
      , customer: require('./customer.js')(app, magento, url, magento_confs, sync_shops_confs).dnode
      , error: require('./error.js')(app, magento, url, magento_confs, sync_shops_confs).dnode
      , sync_shop: require('./sync_shop.js')(app, magento, url, magento_confs, sync_shops_confs).dnode
    }
  }
}