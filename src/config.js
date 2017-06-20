'use strict';

function getCardLayout(callback) {
	chrome.storage.sync.get({cardOrder: DEFAULT_LAYOUT}, function(items) {
		callback(items.cardOrder);
	});
}

function saveCardLayout() {
	var cardOrder = {left: [], right: []};
	$('.card', '#left-col').each(function() {
		cardOrder.left.push($(this).attr('id'));
	});
	$('.card', '#right-col').each(function() {
		cardOrder.right.push($(this).attr('id'));
	});
	chrome.storage.sync.set({cardOrder: cardOrder});
}

function showAddLinks() {
	var config = $("#configure").parent();
	for (let i = 0; i < CARDS.length; i++) {
		let id = CARDS[i];
		if ($("#" + id).length === 0) {
			showAddLink(config, id);
		}
	}	
}

function showAddLink(configLink, id) {
	var div = $("<div>").addClass("p-4");
	var text = id
		.split("-")
		.map(function (s) { return s.slice(0, 1).toUpperCase() + s.slice(1); })
		.join(" ");
	var a = $("<a>")
		.addClass("add")
		.attr("href", "#")
		.data("card", id)
		.text(text);
	div.append(a);
	div.hide().insertAfter(configLink).fadeIn("fast");
}

function showCardFronts() {
	$(".card-config").hide();
	$(".card-front").show();
}

function showCardConfigs() {
	$(".card-front").hide();
	$(".card-config").show();
	$(".card").each(function() {
		var card = $(this);
		if (card.find(".links").length > 0) {
			card.find(".config-count").show();
		} else {
			card.find(".config-count").hide();
		}
	});
}

// Event listeners

$(function() {
	var drake = dragula();

	$("#configure").on("click", function(e) {
		e.preventDefault();
		e.stopPropagation();

		var link = $(this);
		if (link.data('state') === 'configuring') {
			link.text('Configure');
			link.data('state', 'done');
			showCardFronts();
			drake.containers.splice(0, drake.containers.length);
		} else {
			link.text('Done');
			link.data('state', 'configuring');
			showCardConfigs();
			drake.containers.push(document.getElementById("left-col"), document.getElementById("right-col"));
		}

		return false;
	});

	$(document).on("click", ".footer .add", function(e) {
		e.preventDefault();
		e.stopPropagation();

		var col = null;
		var colStr = null;
		var left = $("#left-col");
		var right = $("#right-col");
		if ($(".card", left).length > $(".card", right).length) {
			col = right;
			colStr = "right";
		} else {
			col = left;
			colStr = "left";
		}
		var id = $(this).data("card");
		show(id, col);
		$(this).parent().remove();

		// Save
		chrome.storage.sync.get({cardOrder: DEFAULT_LAYOUT}, function(items) {
			var cardOrder = items.cardOrder;
			cardOrder[colStr].push(id);
			chrome.storage.sync.set({cardOrder: cardOrder});
		});

		return false;
	});

	$(document).on("click", ".remove", function(e) {
		e.preventDefault();
		e.stopPropagation();

		var card = $(this).closest('.card');
		if (card.attr('id') === 'clock') {
			clock = null;
		}
		card.fadeOut('fast', function() {
			card.remove();
			saveCardLayout();
			showAddLink($("#configure").parent(), card.attr('id'));
		});

		return false;
	});

	$(document).on("click", ".config-count > button", function(e) {
		e.preventDefault();
		e.stopPropagation();

		var btn = $(this);
		if (!btn.hasClass("btn-secondary")) {
			// Nothing changes
			return false;
		}
		activateCountButton(btn);
		
		var count = btn.val();
		var card = btn.closest('.card');
		showLinkCount(card, count);

		var store = {};
		store[card.attr("id") + "-count"] = count;
		chrome.storage.sync.set(store);

		return false;
	});

	$(document).on("change", "#select-bookmark-folder", function(e) {
		e.preventDefault();
		e.stopPropagation();

		var id = $(this).val();
		chrome.storage.sync.set({bookmarkFolderId: id});
		listBookmarks($("#bookmarks"), id);

		return false;
	});

	drake.on("drop", function(el, target, source, sibling) {
		saveCardLayout();
	});
});
