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

		// get header information
		let header = await vmw.getDLGHeader({
			downloadGroup: 'NSX-T-30110',
			productId: 982
		});
		console.log(JSON.stringify(header, null, "\t"));

		// get and display latest [ vmware_nsx_t_data_center ] information
		let details = await vmw.getDLGDetails({
			downloadGroup: 'NSX-T-30110',
			productId: 982
		});
		console.log(JSON.stringify(details, null, "\t"));

		// filter result for [ nsx-unified-appliance* ]
		let fileInfo = details.downloadFiles.filter((file) => {
			return (new RegExp('nsx-unified-appliance', 'g').exec(file.fileName));
		})[0];

		// create download request
		let json = {
			"locale": "en_US",
			"downloadGroup": details.downloadGroup,
			"productId": details.productId,
			"md5checksum": details.md5checksum,
			"tagId": details.tagId,
			"uUId": details.uuid,
			"dlgType": details.dlgType,
			"productFamily": details.productFamily,
			"releaseDate": details.releaseDate,
			"dlgVersion": details.version,
			"isBetaFlow": false
		};
		/*
		let result = await this.client.getDownload(json);
		*/

		// print to console
		//console.log(JSON.stringify(response, null, "\t"));
	} catch(error) {
		console.log(error.message);
	}
})();
