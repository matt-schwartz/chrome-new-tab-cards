'use strict';

var clock = null;

function show(id, column) {
	if ($(id).length > 0) {
		return;
	}
	switch (id) {
		case "most-visited":
			createMostVisited(column);
			break;
		case "clock":
			createClock(column);
			break;
		case "recently-closed":
			createRecentlyClosed(column);
			break;
	}
}

function createCard(id, title, column, callback) {
	var newCard = $("#card-template").clone();
	newCard.attr('id', id).appendTo(column);
	$(".card-title", newCard).text(title);
	callback(newCard);
	// Note the callback must .show() the card
}

function listLinks(card, urls) {
	var list = $("<ul>").attr("class", "list-group list-group-flush links card-front-extended");
	card.append(list);
	for (let i = 0; i < urls.length; i++) {
		var li = $("<li>").addClass('list-group-item');
		list.append(li);
		var a = $("<a>").attr("href", urls[i].url).text(urls[i].title);
		li.append(a);
		var img = $("<img>").attr("src", "chrome://favicon/" + urls[i].url);
		a.prepend(img);
	}

	var store = {};
	var key = card.attr("id") + "-count";
	store[key] = DEFAULT_LINK_COUNT;
	chrome.storage.sync.get(store, function(items) {
		var count = items[key];
		showLinkCount(card, count);
		card.fadeIn('fast');
		activateCountButton($(".config-count > button[value=" + count.toString() + "]", card));
	});

	if ($("#configure").data("state") === "configuring") {
		$(".config-count", card).show();
	}
}

function showLinkCount(card, count) {
	$(".list-group-item", card).filter(":gt(" + (count - 1) + ")").hide();
	$(".list-group-item", card).filter(":lt(" + count + ")").show();
}

function activateCountButton(btn) {
	btn.siblings().removeClass("btn-info").addClass("btn-secondary");
	btn.removeClass("btn-secondary").addClass("btn-info");
}

function showTime() {
	if (!clock) {
		return;
	}
	var time = new Date();
	var h = time.getHours();
	var m = time.getMinutes();
	m = (m < 10 ? "0" : "") + m.toString();
	var tod = "pm";
	if (h < 12) {
		tod = "am";
		if (h == 0) {
			h = 12;
		}
	} else if (h > 12) {
		h = h - 12;
	}
	clock.text(h + ":" + m + " " + tod);
}

function createMostVisited(column) {
	createCard("most-visited", "Most Visited", column, function(card) {
		chrome.topSites.get(function (urls) {
			listLinks(card, urls);
		});
	});
}

function createClock(column) {
	createCard("clock", "Clock", column, function(card) {
		clock = $(".card-front .card-title", card);
		clock.parent().addClass("text-center");
		showTime();
		setInterval(showTime, 10000);
		card.fadeIn('fast');
	});
}

function createRecentlyClosed(column) {
	createCard("recently-closed", "Recently Closed", column, function(card) {
		chrome.sessions.getRecentlyClosed({maxResults: MAX_LINK_COUNT}, function(sessions) {
			var count = 0;
			var limit = MAX_LINK_COUNT;
			var urls = [];
			function addTab(tab) {
				if (tab.url.startsWith('http://') || tab.url.startsWith('https://')) {
					urls.push({url: tab.url, title: tab.title});
					count++;
				}
			}
			for (var i = 0; i < sessions.length; i++) {
				if (count > limit) {
					break;
				}
				var session = sessions[i];
				var tab = null;
				if (session.window && session.window.tabs) {
					for (var j = 0; j < session.window.tabs.length; j++) {
						if (count > limit) {
							break;
						}
						addTab(session.windows.tabs[i]);
					}
				} else {
					addTab(session.tab);
				}
			}
			listLinks(card, urls);
		});
	});
}
