#!/usr/bin/env node
const vmwClient = require('../lib/vmw-sdk');
const vmw = new vmwClient();

// params.json
/*=> {
        "username": "my.username",
        "password": "my.password"
}*/
const params = require('./params.json');
const username = params.username;
const password = params.password;

(async() => {
	try {
		// login
		await vmw.login({
			username: username,
			password: password
		});

		// get and display accountInfo
		let response = await vmw.accountInfo();
		console.log(JSON.stringify(response, null, "\t"));
	} catch(error) {
		console.log(error.message);
	}
})();
