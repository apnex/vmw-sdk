#!/usr/bin/env node
const vmwClient = require('../lib/vmw-sdk');
const vmw = new vmwClient();

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

		// get product index
		let products = await vmw.getProducts();
		//=> '[ { name: "VMware vSphere", actions: [ ... ] } ]'

		console.log(JSON.stringify(products, null, "\t"));
	} catch (error) {
		console.log(error.message);
	}
})();
