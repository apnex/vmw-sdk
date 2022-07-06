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

		// get and display latest [ vmware_nsx_t_data_center ] information
		let response = await vmw.getRelatedDLGList({
			category: 'networking_security',
			product: 'vmware_nsx_t_data_center',
			version: '3_x',
			//dlgType: 'PRODUCT_BINARY'
			dlgType: 'OPEN_SOURCE'
		});

		// print to console
		console.log(JSON.stringify(response, null, "\t"));
	} catch(error) {
		console.log(error.message);
	}
})();
