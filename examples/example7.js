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

		// select download group
		let body = {
			downloadGroup: 'NSX-T-30110',
			productId: 982
		};

		// get header information
		let header = await vmw.getDLGHeader(body);

		// get and display latest [ vmware_nsx_t_data_center ] information
		let details = await vmw.getDLGDetails(body);

		// filter first file result for [ nsx-unified-appliance* ]
		let fileInfo = details.downloadFiles.filter((file) => {
			return (new RegExp('nsx-unified-appliance', 'g').exec(file.fileName));
		})[0];

		// check if permitted to download
		if(details.eligibilityResponse.eligibleToDownload) {
			// create and fire off download request
 			let result = await vmw.getDownload({
				"locale": "en_US",
				"downloadGroup": header.dlg.code,
				"productId": header.product.id,
				"md5checksum": fileInfo.md5checksum,
				"tagId": header.dlg.tagId,
				"uUId": fileInfo.uuid,
				"dlgType": header.dlg.type.replace(/&amp;/g, '&'), // convert &amp to &
				"productFamily": header.product.name,
				"releaseDate": fileInfo.releaseDate,
				"dlgVersion": fileInfo.version,
				"isBetaFlow": false
			});
			console.log(JSON.stringify(result, null, "\t"));
		} else {
			throw new Error('Not permitted to download this file, check account entitlement');
		}
	} catch(error) {
		console.log(error.message);
	}
})();
