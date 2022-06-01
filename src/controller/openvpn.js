const {exec} = require('child_process');
const {promisify} = require('util');

const RESTART_COMMAND = [
	'sudo -n systemctl stop openvpn-client@protonvpn',
	'sleep 5',
	'sudo -n systemctl start openvpn-client@protonvpn'
].join(' && ');

const execAsync = promisify(
	(command, callback) => exec(
			command,
			(err, ...results) => callback(err, results)
	)
);

class OpenVPNController {
	restart() {
		return new Promise((res, rej) => {
			exec(RESTART_COMMAND, (err, stdout, stderr) => {
				if (err) return rej(err);

				res({error: stderr || ''});
			});
		});
	}
}

module.exports = { OpenVPNController };
