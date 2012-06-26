// sublime: tab_size 2; translate_tabs_to_spaces true

//var magento = require('../magento_funcs');

module.exports = function (app, magento, url, magento_confs, sync_shops_confs) {

  function index_request (req, res){
      res.render('customer_index', {title: 'Bugwelder Sync' });
  }

  return {
    request: {
        index: index_request
    },
    dnode: {

    }
  }

}