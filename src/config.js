'use strict';

function getCardLayout(callback) {
	var defaultCardOrder = {left: ["most-visited"], right: ["clock", "recently-closed"]};
	chrome.storage.sync.get({cardOrder: defaultCardOrder}, function(items) {
		callback(items.cardOrder);
	});
}

$(function() {
	var drake = dragula();

	$("#configure").on("click", function(e) {
		e.preventDefault();
		e.stopPropagation();

		var link = $(this);
		if (link.data('state') === 'configuring') {
			link.text('Configure');
			link.data('state', 'done');
			$(".card-config").hide();
			$(".card-front").show();
			drake.containers.splice(0, drake.containers.length);
		} else {
			link.text('Done');
			link.data('state', 'configuring');
			$(".card-front").hide();
			$(".card-config").show();
			drake.containers.push(document.getElementById("left-col"), document.getElementById("right-col"));
			$(".card").each(function() {
				var card = $(this);
				if (card.find(".links").length > 0) {
					card.find(".count").show();
				} else {
					card.find(".count").hide();
				}
			});
		}

		return false;
	});
	
	$(".config-switch > button").on("click", function(e) {
		e.preventDefault();
		e.stopPropagation();

		var on = null;
		var off = null;
		if ($(this).val() === "on") {
			on = $(this);
			off = on.siblings().first();
		} else {
			off = $(this);
			on = off.siblings().first();
		}

		on.toggleClass("btn-secondary").toggleClass("btn-success");
		off.toggleClass("btn-secondary").toggleClass("btn-danger");

		// TODO: Save
		
		return false;
	});

	$(".config-count > button").on("click", function(e) {
		e.preventDefault();
		e.stopPropagation();

		var btn = $(this);
		if (!btn.hasClass("btn-secondary")) {
			// Nothing changes
			return false;
		}
		btn.siblings().removeClass("btn-info").addClass("btn-secondary");
		btn.removeClass("btn-secondary").addClass("btn-info");
		
		// TODO: Save

		return false;
	});

	drake.on("drop", function(el, target, source, sibling) {
		var cardOrder = {left: [], right: []};
		$('.card', '#left-col').each(function() {
			cardOrder.left.push($(this).attr('id'));
		});
		$('.card', '#right-col').each(function() {
			cardOrder.right.push($(this).attr('id'));
		});
		chrome.storage.sync.set({cardOrder: cardOrder});
	});
});
