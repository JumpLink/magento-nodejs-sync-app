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
	// console.log('Radio Wert: ' + filter_type);
	// console.log('Select Wert: ' + shop);
	// console.log('Input Wert: ' + input);
	// DNode.connect(function (remote) {
	// 	remote.loading(function (html) {
	// 		$('.span10').html(html);
	// 	});
	// });

	DNode.connect(function (remote) {
		remote.product_list(filter_type, input, shop, function (html) {
			$('.span10').html(html);
		});
	});

}
