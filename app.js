import express from 'express';
import sessions from 'client-sessions';
import passport from 'passport';
import { Strategy } from 'passport-spotify';
import Spotify from 'spotify-web-api-node';

passport.serializeUser((user, done) => {
	done(null, user);
});

passport.deserializeUser((obj, done) => {
	done(null, obj);
});

passport.use(new Strategy({
	clientID: process.env.SPOTIFY_CLIENT_ID,
	clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
	callbackURL: (process.env.NODE_ENV === 'production' ? 'https://practice.kelsin.net/callback/' : 'https://localhost/callback/')
}, (accessToken, refreshToken, profile, done) => {
	// asynchronous verification, for effect...
	process.nextTick(() => {
		// To keep the example simple, the user's spotify profile is returned to
		// represent the logged-in user. In a typical application, you would want
		// to associate the spotify account with a user record in your database,
		// and return that user instead.
		profile.accessToken = accessToken;
		profile.refreshToken = refreshToken;
		return done(null, profile);
	});
}));

const app = express();

app.use(sessions({
	cookieName: 'user',
	secret: process.env.COOKIE_SECRET || 'practiceDevelopCookieSecret'
}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
	res.json({works: true});
});

app.get('/login',
				passport.authenticate('spotify', {scope: ['playlist-read-private', 'playlist-read-collaborative']}),
				() => {});

app.get('/callback',
				passport.authenticate('spotify', { failureRedirect: '/' }),
				(req, res) => {
					res.redirect('/');
				});

app.get('/playlists', (req, res) => {
	let api = new Spotify();
	api.setAccessToken(req.user.accessToken);
	api.getUserPlaylists()
		.then((data) => {
			res.json(data);
		}, (err) => {
			console.error(err);
		});
});

app.get('/playlists/:user/:id', (req, res) => {
	let api = new Spotify();
	api.setAccessToken(req.user.accessToken);
	api.getPlaylist(req.params.user, req.params.id)
		.then((data) => {
			res.json(data);
		}, (err) => {
			console.error(err);
		});
});

app.listen(process.env.PORT || 3000, function() {
	console.log('Practice server listening on ' + this.address().port);
});
