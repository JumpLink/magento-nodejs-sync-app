var render_parameter = require('../config/sync_shops.js').render_parameter;
var error = {};

error.e408 = function (req, res) {
  res.render('408', render_parameter);
}
