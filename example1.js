#!/usr/bin/env node
'use strict';
const vmwClient = require('./vmw.sdk');
const fs = require('fs');

const params = require('./params.json');
var username = params.username;
var password = params.password;

(async(id) => {
	let client = new vmwClient(); // return 'configured' client
	try {
		// login
		await client.login({username, password});

		// get products
		let products = await client.getProducts();

		// build result list
		let result = [];
		const links = products.productCategoryList[0].productList;
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
		console.log(JSON.stringify(result, null, "\t"));
	} catch(error) {
		console.log(error.message);
	}
})();
