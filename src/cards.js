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
	for (var i = 0; i < urls.length; i++) {
		var li = $("<li>").addClass('list-group-item');
		list.append(li);
		var a = $("<a>").attr("href", urls[i].url).text(urls[i].title);
		li.append(a);
		var img = $("<img>").attr("src", "chrome://favicon/" + urls[i].url);
		a.prepend(img);
	}
	card.show();
}

function showTime() {
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
		card.show();
	});
}

function createRecentlyClosed(column) {
	createCard("recently-closed", "Recently Closed", column, function(card) {
		chrome.sessions.getRecentlyClosed({maxResults: 10}, function(sessions) {
			var count = 0;
			var limit = 10;
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
