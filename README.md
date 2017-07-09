Chrome New Tab Cards Extension
==============================

New Tab Cards is an extension for the Chrome browser.  It replaces the new tab page with minimalist, customizable card displays for most visited, bookmarks, recently closed, and more.

![Screenshot](https://user-images.githubusercontent.com/5067345/27460427-cbfd86de-5781-11e7-99cf-97fb43d2f43a.png)
![Configuration Screenshot](https://user-images.githubusercontent.com/5067345/27460432-d16f6754-5781-11e7-9ea6-f61994fe0e58.png)

Install
-------

Distributed via the [Chrome Web Store](https://chrome.google.com/webstore/detail/new-tab-cards/idcpogancielddambnachkghlnjkfhci).

Or after cloning this repo:

    npm install

After downloading package dependencies this will run `postinstall.sh` and place the few necessary JS and CSS files into the `/src/vendor`.  This keeps the source directory clean for packaging the extension.

Sign up for an API key with OpenWeatherMap.org and paste it into `src/keys.js`.

Browse to `chrome://extensions/`, turn on developer mode, click "Load unpacked extension...", and choose the `src` directory.

Attribution
-----------

Weather data provided by [OpenWeatherMap.org](https://openweathermap.org/).

Contributors:
- [Nishant Kumar](https://github.com/nishant8BITS)

TODO
----

In the future we plan on adding:
- A Chrome Apps launcher card
- Better weather icons
