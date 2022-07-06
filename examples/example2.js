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

		// get and display accountInfo
		let response = await vmw.getProducts();

		// construct a normalised product index from links
		let links = response.productCategoryList[0].productList;
		let result = links.map((item) => {
			let target = item.actions.filter((link) => {
				return (link.linkname == 'View Download Components');
			})[0].target;
			let values = target.split('/');
			return {
				name: item.name,
				target: target,
				category: values[3],
				product: values[4],
				version: values[5],
				dlgType: 'PRODUCT_BINARY' // default type
			};
		});

		// print to console
		console.log(JSON.stringify(result, null, "\t"));
	} catch(error) {
		console.log(error.message);
	}
})();
