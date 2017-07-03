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
		case "recently-closed":
			createRecentlyClosed(column);
			break;
		case "bookmarks":
			createBookmarks(column);
			break;
		case "other-devices":
			createOtherDevices(column);
			break;
		case "clock":
			createClock(column);
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
	var list = null;
	var group = $(".links", card);
	var li,anchor,img;

	if (group.length === 0) {
		list = $("<ul>").attr("class", "list-group list-group-flush links card-front-extended");
		card.append(list);
	} else {
		list = group.first();
	}

	for (let i = 0, len=urls.length; i < len ; i++) {
		li = $("<li>").addClass('list-group-item');
		list.append(li);
		anchor = $("<a>").attr("href", urls[i].url).text(urls[i].title);
		li.append(anchor);
		img = $("<img>").attr("src", "chrome://favicon/" + urls[i].url);
		anchor.prepend(img);
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

function listSessions(card, sessions, max) {
	var count = 0;
	var urls = [];
	function addTab(tab) {
		if (tab.url.startsWith('http://') || tab.url.startsWith('https://')) {
			urls.push({url: tab.url, title: tab.title});
			count++;
		}
	}
	for (let i = 0, len=sessions.length; i < len; i++) {
		if (count > max) {
			break;
		}
		let session = sessions[i];
		let tab = null;
		if (session.window && session.window.tabs) {
			for (let j = 0; j < session.window.tabs.length; j++) {
				if (count > max) {
					break;
				}
				addTab(session.window.tabs[j]);
			}
		} else {
			addTab(session.tab);
		}
	}
	listLinks(card, urls);

	return count;
}

function listBookmarks(card, folderid) {
	chrome.bookmarks.getChildren(folderid, function(nodes) {
		$(".links", card).remove();
		var count = 0;
		var urls = [];
		let node;
		for (let i = 0, len = nodes.length; i < len; i++) {
			if (count > MAX_LINK_COUNT) {
				break;
			}
			node = nodes[i];
			if (node && node.url) {
				urls.push(node);
			}
		}
		listLinks(card, urls);
	});

	chrome.bookmarks.get(folderid, function(results) {
		if (results.length > 0) {
			$("#bookmarks .card-front .card-title").text(results[0].title);
		}
	});
}

function addBookmarkFolder(dropdown, nodes, depth) {
	let title, optionElem = $("<option>"),option,node;

	for (let i = 0, len=nodes.length; i <len ; i++) {
		node = nodes[i];
		
		if (!node.url) {
			title = "&nbsp;".repeat(depth * 3) + node.title;
			optionElem = $("<option>");
			option = optionElem.attr("value", node.id).html(title);
			dropdown.append(option);
		}
		if (node.children && node.children.length > 0) {
			addBookmarkFolder(dropdown, node.children, depth + 1);
		}
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
	if (!!clock) {
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

}

function createMostVisited(column) {
	createCard("most-visited", "Most Visited", column, function(card) {
		chrome.topSites.get(function (urls) {
			listLinks(card, urls);
		});
	});
}

function createOtherDevices(column) {
	createCard("other-devices", "Other Devices", column, function(card) {
		chrome.sessions.getDevices({maxResults: MAX_LINK_COUNT}, function(devices) {
			var count = 0,device;
			for (let i = 0, len = devices.length; i < len; i++) {
				device = devices[i];
				count += listSessions(card, device.sessions, MAX_LINK_COUNT - count);
				if (count >= MAX_LINK_COUNT) {
					break;
				}
			}
		});
	});
}

function createBookmarks(column) {
	createCard("bookmarks", "Bookmarks", column, function(card) {
		chrome.bookmarks.getTree(function(results) {

			if (results.length && results[0].children.length) {
				var top = results[0];
				var dropdown = $("<select>").attr('id', 'select-bookmark-folder');
				$(".card-config form", card).prepend(dropdown);
				chrome.storage.sync.get({
					bookmarkFolderId: top.children[0].id
				}, function(items) {
					addBookmarkFolder(dropdown, top.children, 0);
					dropdown.val(items.bookmarkFolderId);
					listBookmarks(card, items.bookmarkFolderId);
				});
			}

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
			listSessions(card, sessions, MAX_LINK_COUNT);
		});
	});
}
