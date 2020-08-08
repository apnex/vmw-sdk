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

		// get and display accountInfo
		let response = await vmw.getProducts();

		// construct a normalised download index from links
		let result = [];
		const links = response.productCategoryList[0].productList;
		links.forEach((item) => {
			let target = item.actions.filter((link) => {
				return (link.linkname == 'View Download Components');
			})[0].target;
			let values = target.split('/');
			result.push({
				name: item.name,
				target: target,
				category: values[3],
				product: values[4],
				version: values[5],
				dlgType: 'PRODUCT_BINARY'
			});
		});

		// print to console
		console.log(JSON.stringify(result, null, "\t"));
	} catch(error) {
		console.log(error.message);
	}
})();
