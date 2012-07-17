// sublime: tab_size 2; translate_tabs_to_spaces true
var json_shops_confs = require('./config/sync_shops.js');
var url = require('./public/javascripts/url_funcs.js');
var fetchUrl = require("fetch").fetchUrl;
var magento = require('./magento_funcs');

var render_parameter = {
    title: json_shops_confs[0].name + ' Sync'
  , json_shops_confs: json_shops_confs
  , magento_confs: magento.confs
  , magento_shop: magento.confs[0]
  , sync_shop: json_shops_confs[0]
  , sync_shop_url: "/"+json_shops_confs[0].url
  , filter_shop: 0 //TODO
};

var config = require('./config/config.js');
var general_conf = config.open(__dirname + "/config/general.json");

function get_json(uri, cb) {
  fetchUrl(uri, function(error, meta, body){
      //console.log(body.toString());
      if(typeof body != 'undefined') {
        var data = JSON.parse(body.toString());
        cb(data);
      } else {
        cb(null);
      }
  });
}

function parse_info_filter(sku, cb) {
  
  value = decodeURIComponent(sku)
  var url_string = json_shops_confs[0].host + json_shops_confs[0].path;
  url_string = url.setParameterUrl(url_string, json_shops_confs[0].sku_var_name, value);
  url_string = url.setParameterUrl(url_string, json_shops_confs[0].login, json_shops_confs[0].pass);
  //console.log('url_string: ' + url_string);
  url_string = encodeURIComponent(url_string);
  if(cb != null)
    cb(url_string);
  else
    return url_string;
}

function get_partnums_url(cb) {
  
  var url_string = json_shops_confs[0].host + json_shops_confs[0].partnums_path;
  url_string = encodeURIComponent(url_string);
  if(typeof cb != 'undefined')
    cb(url_string);
  else
    return url_string;
}

function splitDescriptionData(rawDescription) {
  var description = {};
  description.values = rawDescription.split('$');
  description.names = new Array(description.values.length);

  switch (description.values.length) {
    case 5:
      description.names[4] = 'Metrics';
    case 4:
      description.names[3] = 'Fitting Info';
    case 3:
      description.names[2] = 'Quality';
    case 2:
      description.names[1] = 'Description';
    case 1:
      description.names[0] = 'Applications';
  }
  return description;
}

function getDate() {
  var now = new Date(); 
  var d = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
  var curr_date = d.getDate();
  var curr_month = d.getMonth();
  curr_month++;
  var curr_year = d.getFullYear();
  return curr_month + "/" + curr_date + "/" + curr_year;
}

function getTime() {
  var a_p = "";
  var now = new Date(); 
  var d = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
  var curr_hour = d.getHours();
  if (curr_hour < 12) {
    a_p = "AM";
  }
  else {
    a_p = "PM";
  }
  if (curr_hour == 0) {
    curr_hour = 12;
  }
  if (curr_hour > 12) {
    curr_hour = curr_hour - 12;
  }

  var curr_min = d.getMinutes();

  curr_min = curr_min + "";

  if (curr_min.length == 1) {
  curr_min = "0" + curr_min;
  }

  return curr_hour + ":" + curr_min + " " + a_p;
}

function roundPrice(x) {
  var k = (Math.round(x * 100) / 100).toString();
  k += (k.indexOf('.') == -1)? '.00' : '00';
  return Number(k.substring(0, k.indexOf('.') + 3));
}

function getProductDataForMagentoAttributes(sku, rawData, cb) {
  var data = {};
  for (var i = rawData.COLUMNS.length - 1; i >= 0; i--) {
    data[json_shops_confs[0].url+'_'+rawData.COLUMNS[i].toLowerCase().replace(" ","_")]=rawData.DATA[rawData.COLUMNS[i]][0];
    //console.log(begin_string+'_'+rawData.COLUMNS[i].toLowerCase());
  }
  var description = splitDescriptionData(data.vwheritage_description);
  for (var i = description.names.length - 1; i >= 0; i--) {
    if(description.names[i] !== 'undefined' && description.names[i] != null && description.names[i].length > 0)
      data[json_shops_confs[0].url+'_'+description.names[i].toLowerCase().replace(" ","_")]=description.values[i];
  }
  delete data[json_shops_confs[0].url+'_itemnumber'];
  //data[json_shops_confs[0].url+'_lastupdate'] = new Date().toJSON();
  data[json_shops_confs[0].url+'_lastupdate'] = getDate()+" "+getTime();
  //console.log(data[json_shops_confs[0].url+'_lastupdate']);
  data[json_shops_confs[0].url+'_retailprice'] = roundPrice(Number(data[json_shops_confs[0].url+'_retailprice']) * Number(general_conf.GBP_factor));
  data[json_shops_confs[0].url+'_costprice'] = roundPrice(Number(data[json_shops_confs[0].url+'_costprice']) * Number(general_conf.GBP_factor));
  //console.log('umrechnungsfaktor: ');
  //console.log(Number(general_conf.GBP_factor));
  cb(sku, data);
}

function set_render_parameter(data, cb) {
  var parameter = render_parameter;
      parameter.url = "/"+json_shops_confs[0].url;
      parameter.attribute_values = data.DATA;
      parameter.attribute_names = data.COLUMNS;
      if(data.ROWCOUNT>0 && parameter.attribute_values.DESCRIPTION) {
        //console.log(parameter.attribute_values.DESCRIPTION);
        var description = splitDescriptionData(parameter.attribute_values.DESCRIPTION[0])
        parameter.description_values = description.values;
        parameter.description_names = description.names;
      }
      parameter.shop_param = '';
  if(typeof cb !== 'undefined')
    cb(parameter);
  else
    return parameter;
}

function get_products(url_string, cb) {
  url_string = decodeURIComponent(url_string);
  get_json(url_string, function(data) {
    if(data != null) {
      //console.log(data);
      if(typeof cb != 'undefined')
        cb(data);
      else
        return data;
    } else {
      //error.e408(req, res); TODO
    }
  });
}

exports.parse_info_filter = parse_info_filter;
exports.render_parameter = render_parameter;
exports.set_render_parameter = set_render_parameter;
exports.get_products = get_products;
exports.get_partnums_url = get_partnums_url;
exports.get_json = get_json;
exports.splitDescriptionData = splitDescriptionData;
exports.getProductDataForMagentoAttributes = getProductDataForMagentoAttributes;