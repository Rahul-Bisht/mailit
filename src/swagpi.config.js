module.exports = {
	"Email": [
		{
			verb: 'POST',
			route: "/email",
			title: "Send an email",
			description: "Sends an email with the default SMTP settings.",
			queries: {
				"from": {
					description: 'Sender email address.', 
					optional: true
				},
				"to": {
					description: 'Recipient email address(es).', 
					optional: false
				},
				"subject": {
					description: 'Email subject.', 
					optional: false
				},
				"text": {
					description: 'Text version of the email.', 
					optional: false
				},
				"html": {
					description: 'HTML version of the email.', 
					optional: true
				}
			}
		},{
			verb: 'POST',
			route: "/email/:email/verify",
			title: "Verify an email",
			description: "Verifies whether an email and password is correct.",
			params: {
				"email": {
					description: 'The email address to verify.', 
					optional: false
				},
			},
			queries: {
				"pass": {
					description: 'The email password.', 
					optional: false
				}
			},
		}
	]
}
