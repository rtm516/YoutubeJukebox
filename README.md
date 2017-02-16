# Youtube jukebox
[![Known Vulnerabilities](https://snyk.io/test/github/rtm516/youtubejukebox/badge.svg)](https://snyk.io/test/github/rtm516/youtubejukebox)  
This project provides a simple way of implementing a jukebox running from nodejs and youtube.

## Libraries
* [Boostrap v3.3.7](http://getbootstrap.com/)
* [jQuery v3.1.1](https://jquery.com/)
* [HTML5 Shiv v3.7.3](https://github.com/aFarkas/html5shiv)
* [Respond.js v1.4.2](https://github.com/scottjehl/Respond)

## Node modules
* [Express](http://expressjs.com/)
* [EJS](http://www.embeddedjs.com/)
* [body-parser](https://github.com/expressjs/body-parser)
* [Request](https://github.com/request/request)
* [Helmet](https://github.com/helmetjs/helmet)
* [htmlencode](https://www.npmjs.com/package/htmlencode)
* [nodemon](https://github.com/remy/nodemon) (Optional)

## Setup
Download the repository and extract if in a zip, then run.
`npm install`
This will install all the required modules.
If you would like to use the supplied batch file to make the server reboot automatically then run either
`npm install nodemon`
or 
`npm install -g nodemon`
to install it globally

## Config
* `port`
  * The port to run the webserver on
  * Type: `integer`
  * Default: `3000`
* `youtubeAPIKey`
  * Your API key for the youtube API.
  * Can be obtained from [here](https://console.developers.google.com/apis/credentials) and [this](https://console.developers.google.com/apis/api/youtube) API needs to be enabled.
  * Type: `string`
  * Default: `'youtube api key here'`
* `defaultPlaylist`
  * The default playlist to play if there is no songs queued. If it is set to `''` then it will be disabled.
  * Type: `string`
  * Default: `'PLx0sYbCqOb8Q_CLZC2BdBSKEEB59BOPUM'` ([UK Top 40 Songs](https://www.youtube.com/playlist?list=PLx0sYbCqOb8Q_CLZC2BdBSKEEB59BOPUM))
* `defaultRandomOrder`
  * True if you want the default playlists songs to be played in a random order.
  * Type: `boolean`
  * Default: `true`
* `playerControls`
  * Should the youtube player controls be shown.
  * Type: `boolean`
  * Default: `false`
* `playerLockedHosts`
  * Should the player page be restricted to certain connection domains.
  * EG: jukebox.yoursite.com would be denied but if navigated to localhost then it would be accepted.
  * Type: `boolean`
  * Default: `true`
* `playerLockedHostsList`
  * Domain list for above setting.
  * Type: `string array`
  * Default: `["localhost", "127.0.0.1"]`

## Links
* [My website](https://rtm516.co.uk/)
* [Node.js](https://nodejs.org/en/)
* [Youtube data API](https://developers.google.com/youtube/v3/)
* [Youtube iframe API](https://developers.google.com/youtube/iframe_api_reference)
