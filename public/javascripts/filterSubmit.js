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