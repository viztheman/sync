const webserver = require('./webserver');
const sendPug = require('./pug').sendPug;
const csrf = require('./csrf');
const url = require('url');
const LOGGER = require('@calzoneman/jsli')('web/vpn-reset');

function verifyReferrer(req, expected) {
	const referrer = req.header('referer');

	if (!referrer)
		return true;

	try {
		const parsed = url.parse(referrer);

		if (parsed.pathname !== expected) {
			LOGGER.warn(
				'Possible attempted forgery: %s POSTed to %s',
				referrer,
				expected
			);
			return false;
		}

		return true;
	} catch (error) {
		return false;
	}
}

async function handleResetPage(req, res) {
	const user = await webserver.authorize(req);
	if (!user) return res.redirect('/login');

	sendPug(res, 'vpn-reset', {});
}

async function handleReset(openVPNController, req, res) {
	csrf.verify(req);

	if (!verifyReferrer(req, '/super/secret/reset')) {
		res.status(403).send('Mismatched referrer');
		return;
	}

	const user = await webserver.authorize(req);
	if (!user) res.redirect('/login');
	
	const results = await openVPNController.restart();
	sendPug(res, 'vpn-reset', results);
}

module.exports = {
	init: function (app, openVPNController) {
		app.get('/super/secret/reset', handleResetPage);
		app.post('/super/secret/reset', (req, res) => {
			handleReset(openVPNController, req, res);
		});
	}
};
