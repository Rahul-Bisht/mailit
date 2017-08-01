const nodemailer = require('nodemailer');
const wellKnowns = require('./util/wellKnowns');

const createTransport = (config) => {
	let rejectUnauthorized = (config.rejectUnauthorized !== undefined) 
		? config.rejectUnauthorized 
		: true;

	const transportConfig = {
	    host: config.host,
	    port: config.port,
	    secure: config.secure || false,
	    connectionTimeout: 5000,
	    tls: {
        	rejectUnauthorized
    	},
	    auth: {
	        user: config.user,
	        pass: config.pass
	    }
	}
	return nodemailer.createTransport(transportConfig);
}

const sendEmail = (config, options) => {
	return new Promise((resolve, reject) => {
		const transporter = createTransport(config);
		let mailOptions = {
			from: options.from || config.user,
			to: options.to,
			subject: options.subject,
			text: options.text,
			html: options.html
		};
		transporter.sendMail(mailOptions, (error, info) => {
		    if (error) {
		    	return reject({success: false, status: 503, message: error.message});
		    }
		    return resolve({success: true, info: info});
		});
	});
}

const verifyTransport = (transports, email, pass) => {
	transports = transports || {};
	return new Promise((resolve, reject) => {
		let domain = String(email).split('@')[1];
		let domainPrefix = String(String(domain).split('.')[0]).toLowerCase();
		let transport = transports[domain];

		let wellKnownIndex = wellKnowns.indexOf(domainPrefix);
		let wellKnown =  wellKnownIndex > -1 ? wellKnowns[wellKnownIndex] : undefined;

		if (transport === undefined && wellKnown === undefined) {
			return reject({success: false, message: 'Email domain cannot be tested.', status: 400});
		}

		let attempts = [];

		if (transport !== undefined) {
			let rejectUnauthorized = (transport.rejectUnauthorized !== undefined) 
				? transport.rejectUnauthorized
				: true;
			for (let i = 0; i < transport.ports.length; ++i) {
				let port = transport.ports[i];
				let secure = transport.secure[i];
				secure = (secure === undefined) ? false : secure;
				let obj = {
					host: transport.host,
				    connectionTimeout: 5000,
					port,
					secure,
					user: email,
					pass,
					tls: {rejectUnauthorized}
				}
				attempts.push(obj);
			}
		} else {
			let obj = {
				service: 'Yahoo',
			    connectionTimeout: 5000,
			    auth: {
					user: email,
					pass
			    }
			}
			attempts.push(obj);
		}

		let success = false;
		let messages = [];
		function go() {
			if (attempts.length < 1) {
				return resolve({success, messages});
			}
			let next = attempts.pop();
			const transporter = createTransport(next);
			transporter.verify((error, data) => {
			    if (error === undefined || error === null) {
			    	success = true;
			    	attempts = [];
			    	messages.push(`${next.host}:${next.port} - success`);
			    } else {
			    	let message = (typeof error === 'object') ? error.message : error;
			    	messages.push(`${next.host}:${next.port} - ${message}`);
			    }
		    	go();
			});
		}

		go();
	});
}

module.exports = (app, config, ad) => {
	app.post("/email", async (req, res) => {
		const body = req.body;
		sendEmail(config, body).then(data => {
			res.json(data);
		}).catch(err => {
	    	res.status(err.status || 503);
	    	res.send(err);
		});
	});

	app.post("/email/:email/verify", async (req, res) => {
		const email = req.params.email;
		const pass = req.body.pass;
		verifyTransport(config.services, email, pass).then(data => {
			res.json(data);
		}).catch(err => {
	    	res.status(err.status || 503);
	    	res.send(err);
		});
	});


	const start = new Date();
	app.get("/status", async (req, res) => {
		let uptime = new Date() - start;
		res.send({online: true, uptime});
	});
}