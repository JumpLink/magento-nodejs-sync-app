// sublime: tab_size 2; translate_tabs_to_spaces true
function loadStatic(content) {
	switch (content) {
	case 'index':
		DNode.connect(function (remote) {
			remote.index(function (html) {
				$('.span10').html(html);
			});
		});
		break;
	case 'product_index':
		DNode.connect(function (remote) {
			remote.product_index(function (html) {
				$('.span10').html(html);
			});
		});
		break;
	case 'category_index':
		DNode.connect(function (remote) {
			remote.category_index(function (html) {
				$('.span10').html(html);
			});
		});
		break;
	case 'loading':
		DNode.connect(function (remote) {
			remote.loading(function (html) {
				$('.span10').html(html);
			});
		});
		break;
	}
}

function loadProducts(filter_type, input, shop) {
	DNode.connect(function (remote) {
		remote.product_list(filter_type, input, shop, function (html) {
			$('.span10').html(html);
		});
	});

}
function loadSyncShopProductAttributes(get_product_url) {
  DNode.connect(function (remote) {
    remote.sync_product_info(get_product_url, function (html) {
      $('.span10').html(html);
    });
  });
}
function loadSyncShopProductAttributesBySKU(sku, cb) {
  DNode.connect(function (remote) {
    remote.sync_product_info_by_sku(sku, cb);
  });
}