'use strict';

$(function() {
	getCardLayout(function (layout) {
		for (let id of layout.left) {
			show(id, $("#left-col"));
		}
		for (let id of layout.right) {
			show(id, $("#right-col"));
		}
	})
});
