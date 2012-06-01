function has_param(req, param_name, param) {
  var look = req.query[param_name];
  if (look && look == param)
    return true;
  else {
    return false;
  }
}

function is_iframe(req) {
  return has_param(req, 'style', 'is_iframe');
}

/* Shop-Config nach URL-Paramter */
function getURLShop(req, magento) {
  if (req.query['shop']) {
    var paramter_value = decodeURIComponent(req.query['shop']) 
    return magento.confs[paramter_value];
  } else {
    return magento.confs[0]; //Defaultconfig
  }
}

function urlParameterTester(url) {
  return (url.indexOf("?") != -1);
}

function setParameterUrl(url, varname, param) {
  var new_url = url;
  if (urlParameterTester(new_url))
    new_url += '&';
  else
    new_url += '?';
  //new_url.replace('&amp;', '&');
  new_url += varname + '=' +param;
  //console.log('new_url: ' + new_url);
  return new_url;
}

function setIframeUrl(url) {
  if (url.indexOf("style=is_iframe") != -1)
    return url;
  else
    return setParameterUrl(url, 'style', 'is_iframe');
}

function setShopUrl(url, shop) {
  return setParameterUrl(url, 'shop', shop);
}

function setSKUUrl(url, param) {
  return setParameterUrl(url, 'sku', param);
}

function setNameUrl(url, param) {
  return setParameterUrl(url, 'name', param);
}

/* Wenn nicht von nodejs eingebunden, dann */
if(typeof exports == 'undefined'){
  //nichts
} else { //Wenn von Nodejs, dann..
  module.exports.is_iframe = is_iframe;
  module.exports.urlParameterTester = urlParameterTester;
  module.exports.setIframeUrl = setIframeUrl;
  module.exports.setShopUrl = setShopUrl;
  module.exports.has_param = has_param;
  module.exports.getURLShop = getURLShop;
}