#!/usr/bin/env nodeimport vmwClient from '../lib/vmw-sdk';
const vmw = new vmwClient();

// params.json
/*=> {
        "username": "my.username",
        "password": "my.password"
}*/
import params from './params.json';

const username = params.username;
const password = params.password;

(async() => {
	try {
		// login
		await vmw.login({
			username: username,
			password: password
		});

		// get download information for group [ NSX-T-30110 ]
		let response = await vmw.getDLGHeader({
			downloadGroup: 'NSX-T-30110',
			productId: 982
		});

		// print to console
		console.log(JSON.stringify(response, null, "\t"));
	} catch(error) {
		console.log(error.message);
	}
})();
