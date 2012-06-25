// sublime: tab_size 2; translate_tabs_to_spaces true
var render_parameter = require('../config/sync_shops.js').render_parameter;
var error = {};

error.e408 = function (req, res) {
  res.render('408', render_parameter);
}
