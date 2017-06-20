'use strict';

const CARDS = ["most-visited", "recently-closed", "other-devices", "clock"];
const DEFAULT_LAYOUT = {left: ["most-visited"], right: ["recently-closed", "other-devices"]};
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

	$("#about").attr("href", "https://chrome.google.com/webstore/detail/" + chrome.runtime.id);
	// TODO: More elegant solution to showing footer after cards are displayed
	setTimeout(function() { $(".footer").fadeIn("fast"); }, 500);
});
