const express = require('express');
const bodyParser = require('body-parser');
const vorpal = require('vorpal')();
const swagpi = require('swagpi');
const chalk = vorpal.chalk;

const swagpiConfig = require('./src/swagpi.config.js');
const middleware = require('./middleware');
const loadConfig = require('./src/util/loadConfig');
const routes = require('./src/routes');

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
middleware.call(app);

swagpi(app, {
	logo: './src/img/logo.png',
	css: 'img { width: 96px !important; margin-top: 8px !important; }',
	config: swagpiConfig
});

const init = (args) => {

	try {
		const config = loadConfig(args);
		app.listen(config.webPort || 3000);
		routes(app, config);
	} catch(err) {
		vorpal.log(err.message);
		process.exit();
	}

}

vorpal.command('_start')
	.hidden()
	.option('--webPort [number]', 'Port for API to listen on.')
	.option('-c, --config [path]', 'Path to config.json.')
	.option('-h, --host [host]', 'SMTP host.')
	.option('--port [port]', 'SMTP port.')
	.option('-u, --user [user]', 'SMTP user account.')
	.option('-p, --pass [pass]', 'SMTP email password.')
	.option('-s, --secure [secure]', 'Whether to use an encrypted connection.')
	.option('--rejectUnauthorized [boolean]', 'Whether to reject an unauthorized TLS cert.')
	.option('--url [url]', 'URL for Active Directory.')
	.action(function(args, cbk) {
		init(args);
		cbk();
	});

vorpal.log('  MailIt SMTP API');
vorpal.exec(`_start ${process.argv.slice(2).join(' ')}`);
vorpal.delimiter(chalk.cyan('Mail') + chalk.grey('It:'));

