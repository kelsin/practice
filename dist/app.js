'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _clientSessions = require('client-sessions');

var _clientSessions2 = _interopRequireDefault(_clientSessions);

var _passport = require('passport');

var _passport2 = _interopRequireDefault(_passport);

var _passportSpotify = require('passport-spotify');

var _spotifyWebApiNode = require('spotify-web-api-node');

var _spotifyWebApiNode2 = _interopRequireDefault(_spotifyWebApiNode);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_passport2.default.serializeUser(function (user, done) {
	done(null, user);
});

_passport2.default.deserializeUser(function (obj, done) {
	done(null, obj);
});

_passport2.default.use(new _passportSpotify.Strategy({
	clientID: process.env.SPOTIFY_CLIENT_ID,
	clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
	callbackURL: process.env.NODE_ENV === 'production' ? 'https://practice.kelsin.net/callback/' : 'http://localhost:3000/callback/'
}, function (accessToken, refreshToken, profile, done) {
	// asynchronous verification, for effect...
	process.nextTick(function () {
		// To keep the example simple, the user's spotify profile is returned to
		// represent the logged-in user. In a typical application, you would want
		// to associate the spotify account with a user record in your database,
		// and return that user instead.
		profile.accessToken = accessToken;
		profile.refreshToken = refreshToken;
		return done(null, profile);
	});
}));

var app = (0, _express2.default)();

app.use((0, _clientSessions2.default)({
	cookieName: 'user',
	secret: process.env.COOKIE_SECRET || 'practiceDevelopCookieSecret'
}));
app.use(_passport2.default.initialize());
app.use(_passport2.default.session());

app.get('/', function (req, res) {
	res.json({ works: true });
});

app.get('/login', _passport2.default.authenticate('spotify', { scope: ['playlist-read-private', 'playlist-read-collaborative'] }), function () {});

app.get('/callback', _passport2.default.authenticate('spotify', { failureRedirect: '/' }), function (req, res) {
	res.redirect('/');
});

app.get('/playlists', function (req, res) {
	var api = new _spotifyWebApiNode2.default();
	api.setAccessToken(req.user.accessToken);
	api.getUserPlaylists().then(function (data) {
		res.json(data);
	}, function (err) {
		console.error(err);
	});
});

app.get('/playlists/:user/:id', function (req, res) {
	var api = new _spotifyWebApiNode2.default();
	api.setAccessToken(req.user.accessToken);
	api.getPlaylist(req.params.user, req.params.id).then(function (data) {
		res.json(data);
	}, function (err) {
		console.error(err);
	});
});

app.listen(3000, function () {
	console.log('Practice server listening on ' + this.address.port);
});