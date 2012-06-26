// sublime: tab_size 2; translate_tabs_to_spaces true
function loadStatic(content) {
	switch (content) {
	case 'index':
		DNode.connect(function (remote) {
			remote.routes.index(function (html) {
				$('.span10').html(html);
			});
		});
		break;
	case 'product_index':
		DNode.connect(function (remote) {
			remote.routes.product.index(function (html) {
				$('.span10').html(html);
			});
		});
		break;
	case 'category_index':
		DNode.connect(function (remote) {
			remote.routes.category.index(function (html) {
				$('.span10').html(html);
			});
		});
		break;
	case 'loading':
		DNode.connect(function (remote) {
			remote.routes.loading(function (html) {
				$('.span10').html(html);
			});
		});
		break;
	}
}

function loadProducts(filter_type, input, shop) {
  DNode.connect(function (remote) {
    remote.routes.product.list(filter_type, input, shop, function (html) {
      $('.span10').html(html);
    });
  });
}
function loadMagentoShopProductAttributes(id_or_sku, shop, cb) {
  DNode.connect(function (remote) {
    remote.routes.product.info(id_or_sku, shop, cb);
  });
}

function loadSyncShopProductAttributes(get_product_url) {
  DNode.connect(function (remote) {
    remote.routes.sync_shop.product.info(get_product_url, function (html) {
      $('.span10').html(html);
    });
  });
}
function loadSyncShopProductAttributesBySKU(sku, cb) {
  DNode.connect(function (remote) {
    remote.routes.sync_shop.product.info.sku(sku, cb);
  });
}