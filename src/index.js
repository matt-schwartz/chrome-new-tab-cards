'use strict';

const CARDS = ["most-visited", "recently-closed", "clock"];
const DEFAULT_LAYOUT = {left: ["most-visited"], right: ["clock", "recently-closed"]};
const DEFAULT_LINK_COUNT = 10;
const MAX_LINK_COUNT = 20;

$(function() {
	getCardLayout(function (layout) {
		for (let id of layout.left) {
			show(id, $("#left-col"));
		}
		for (let id of layout.right) {
			show(id, $("#right-col"));
		}

		showAddLinks();
	})

	// TODO: More elegant solution to showing footer after cards are displayed
	setTimeout(function() { $(".footer").fadeIn("fast"); }, 500);
});
