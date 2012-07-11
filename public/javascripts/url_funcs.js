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
  if (typeof req === "undefined" || typeof req.query === "undefined" || req.query['shop'] === "undefined") {
    return magento.confs[0]; //Defaultconfig

  } else {
    var paramter_value = decodeURIComponent(req.query['shop']) 
    return magento.confs[paramter_value];
  }
}
function getURLStoreView(req) {
  if (typeof req === "undefined" || typeof req.query === "undefined" || typeof req.query['StoreView'] === "undefined") {
    return null;
  } else {
    return decodeURIComponent(req.query['StoreView']) 
  }
}

/*
 * 2011 $.urlParam written by Sam Deering on JQUERY4U
 * Source: http://www.jquery4u.com/snippets/url-parameters-jquery/#.T8ihOKXgCXZ
 */
function urlParam(name){
    var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results != null)
      return results[1] || 0;
    else
      return 0;
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

function syncProductFilterSubmitOnClick(rValue, sValue, iValue, url) {
  //console.log(url);
  iValue = encodeURIComponent(iValue);
  var url_append = '/product/';
  switch (rValue) {
    case 'Name':
      url_append = setNameUrl(url_append + 'list', iValue);
      break;
    case 'Product':
      url_append = url_append + 'product_id/' + iValue;
      break;
    case 'SKU':
      url_append = setSKUUrl(url_append + 'list', iValue);
      break;
    case 'Set':
      url_append = url_append + 'set/' + iValue;
      break;
    case 'Type':
      url_append = url_append + 'type/' + iValue;
      break;
    case 'Category': //TODO
      url_append = url_append + 'category_id/' + iValue;
      break;
  }
  // if(sValue)
  //   url = setShopUrl(url, sValue);
  parent.location = url + url_append;
}
/* Funktionen werden ausgeführt bei Click auf CategoryButton */
function CategoryLevelSubmitOnClick(shop, input) {
  var url = '/category/level/' + input;
  parent.location = setShopUrl(url, shop)
}
function CategoryTreeSubmitOnClick(shop, input){
  var url = '/category/tree/' + input;
  parent.location = setShopUrl(url, shop);
}
function CategoryProductsSubmitOnClick(shop, input){
  var url = '/category/products/' + input;;
  parent.location = setShopUrl(url, shop);
}
/* on client */
if(typeof exports == 'undefined'){
  //nothing
} else { //son server
  module.exports.is_iframe = is_iframe;
  module.exports.urlParameterTester = urlParameterTester;
  module.exports.setIframeUrl = setIframeUrl;
  module.exports.setShopUrl = setShopUrl;
  module.exports.has_param = has_param;
  module.exports.getURLShop = getURLShop;
  module.exports.setParameterUrl = setParameterUrl;
  module.exports.getURLStoreView = getURLStoreView;
}