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

/* Funktionien für die Clientseitige anpassung der URL für Magento-Filter, Funktion wird ausgeführt bei Click auf ProductButton */
function productFilterSubmitOnClick(rValue, sValue, iValue) {
  console.log('Radio Wert: ' + rValue);
  console.log('Select Wert: ' + sValue);
  console.log('Input Wert: ' + iValue);
  iValue = encodeURIComponent(iValue);
  console.log('Input Wert: ' + iValue);
  var url = '/product/';
  /* Anpassung der URL ohne Parameter */
  switch (rValue) {
    case 'Name':
      /*url = url + 'name/' + iValue;*/
      // mit Parameter
      url = setNameUrl(url + 'list', iValue);
      break;
    case 'Product':
      url = url + 'product_id/' + iValue;
      break;
    case 'SKU':
      /*url = url + 'sku/' + iValue;*/
      // mit Parameter
      url = setSKUUrl(url + 'list', iValue);
      break;
    case 'Set':
      url = url + 'set/' + iValue;
      break;
    case 'Type':
      url = url + 'type/' + iValue;
      break;
    case 'Category': //TODO
      url = url + 'category_id/' + iValue;
      break;
  }

  if(sValue)
    url = setShopUrl(url, sValue);

  console.log('URL: ' + url);
    parent.location = url;
}
function syncProductFilterSubmitOnClick(rValue, sValue, iValue, url) {
  console.log(url);
  iValue = encodeURIComponent(iValue);
  //url += '/product/';
  switch (rValue) {
    case 'Name':
      url = setNameUrl(url + 'list', iValue);
      break;
    case 'Product':
      url = url + 'product_id/' + iValue;
      break;
    case 'SKU':
      url = setSKUUrl(url + 'list', iValue);
      break;
    case 'Set':
      url = url + 'set/' + iValue;
      break;
    case 'Type':
      url = url + 'type/' + iValue;
      break;
    case 'Category': //TODO
      url = url + 'category_id/' + iValue;
      break;
  }
  // if(sValue)
  //   url = setShopUrl(url, sValue);
  parent.location = url;
}
/* Funktion wird ausgeführt bei Click auf ProductButton */
function productShopSubmitOnClick(sValue) {
  parent.location = setShopUrl('/product/list', sValue);
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
}