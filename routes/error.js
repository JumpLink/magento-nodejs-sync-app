// sublime: tab_size 2; translate_tabs_to_spaces true

module.exports = function (app) {

  var render_parameter = require('../config/sync_shops.js').render_parameter;
  var error = {};

  function e408_request (req, res) {
    res.render('408', render_parameter);
  }

  return {
    request: {
        e408: e408_request
    },
    dnode: {

    }
  }

}