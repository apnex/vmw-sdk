## vmw-sdk
A promises-based Node.JS SDK for programmatic access to **my.vmware.com**

This low-level SDK implements a login workflow and provides a structured wrapper for REST API calls.

If you're looking for a CLI tool leveraging this SDK, see [`vmw-cli`](https://github.com/apnex/vmw-cli) instead.

## Highlights
- [Promise API](#api)
- [Stream API](#streams)
- [Pagination API](#pagination)

---
### Install
```
$ npm install apnex/vmw-sdk
```

---
### Usage

###### Promise
```js
// load and create new client instance
const vmwClient = require('@apnex/vmw-sdk');
const vmw = new vmwClient();

// run
(async() => {
	try {
		// login to my.vmware.com
		await vmw.login({
			username: "my.username",
			password: "my.password"
		});

		// get product index
		let products = await vmw.getProducts();

		// print to console
		console.log(JSON.stringify(products, null, "\t"));
		/*=> {
			productCategoryList: [{
				productList: [
					{
						name: "VMware vSphere",
						actions: [ ... ]
					},
					...
				]
			}]
		}*/
	} catch (error) {
		console.log(error.message);
	}
})();
```
---
### API Methods

---
##### .login
Initiates a login session to **my.vmware.com**

Type: `object`
```js
{
	username: "<string>"
	password: "<string>"
}
```

example0.js: Create an authenticated `vmw` client
```js
// load and create new client instance
const vmwClient = require('@apnex/vmw-sdk');
const vmw = new vmwClient();

// run
(async() => {
	try {
		// login to my.vmware.com
		await vmw.login({
			username: "my.username",
			password: "my.password"
		});
	} catch (error) {
		console.log(error.message);
	}
})();
```

---
##### .accountInfo
Retrieves account information

[`example1.js`](https://raw.githubusercontent.com/apnex/vmw-sdk/master/examples/example1.js): Display current account info
```js
// load and create new client instance
const vmwClient = require('@apnex/vmw-sdk');
const vmw = new vmwClient();

// run
(async() => {
	try {
		// login to my.vmware.com
		await vmw.login({
			username: "my.username",
			password: "my.password"
		});

		// get and display accountInfo
		let response = await vmw.accountInfo();
		console.log(JSON.stringify(response, null, "\t"));
		/*=> {
			userType: 'Established',
			accntList: [
				{
					eaNumber,
					eaName,
					isDefault
				},
				...
			]
		}*/
	} catch (error) {
		console.log(error.message);
	}
})();
```

---
##### .getProducts
Retrieves main product/solution list

[`example2.js`](https://raw.githubusercontent.com/apnex/vmw-sdk/master/examples/example2.js): Get product list and build a download index
```js
// load and create new client instance
const vmwClient = require('@apnex/vmw-sdk');
const vmw = new vmwClient();

// run
(async() => {
	try {
		// login to my.vmware.com
		await vmw.login({
			username: "my.username",
			password: "my.password"
		});

		// get products
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
		/*=> [
			{
				"name": "VMware vSphere",
				"target": "./info/slug/datacenter_cloud_infrastructure/vmware_vsphere/7_0",
				"category": "datacenter_cloud_infrastructure",
				"product": "vmware_vsphere",
				"version": "7_0",
				"dlgType": "PRODUCT_BINARY"
			},
			...
		]*/
	} catch (error) {
		console.log(error.message);
	}
})();
```

---
##### .getProductHeader
Retrieves specific product information

Type: `object`
```js
{
	category: '<string>',
	product: '<string>',
	version: '<string>'
}
```

**Note:** You can retrieve available `<category>`,`<product>` and `<version>` values by first calling `.getProducts()`  
See [`example2.js`](https://raw.githubusercontent.com/apnex/vmw-sdk/master/examples/example2.js) above.

[`example3.js`](https://raw.githubusercontent.com/apnex/vmw-sdk/master/examples/example3.js): Display specific product version information
```js
// load and create new client instance
const vmwClient = require('@apnex/vmw-sdk');
const vmw = new vmwClient();

// run
(async() => {
	try {
		// login to my.vmware.com
		await vmw.login({
			username: "my.username",
			password: "my.password"
		});

		// get and display latest [ vmware_nsx_t_data_center ] header information
		let response = await vmw.getProductHeader({
			category: 'networking_security',
			product: 'vmware_nsx_t_data_center',
			version: '3_x'
		});
		/*=> {
			"versions": [
				{
					"id": "3_x",
					"name": "3.x",
					"slugUrl": "./info/slug/networking_security/vmware_nsx_t_data_center/3_x",
					"isSelected": true
				},
				...
			]
		}*/

		// print to console
		console.log(JSON.stringify(response, null, "\t"));
	} catch (error) {
		console.log(error.message);
	}
})();
```

---
##### .getRelatedDLGList
Retrieves file download groups for selected product

Type: `object`
```js
{
	category: '<string>',
	product: '<string>',
	version: '<string>',
	dlgType: '<string>'
}
```

`dlgType` is one of [ `PRODUCT_BINARY`, `DRIVERS_TOOLS`, `OPEN_SOURCE`, `CUSTOM_ISO`, `ADDONS` ]


**Note:** You can retrieve available `<category>`,`<product>` and `<version>` values by first calling `.getProducts()`  
See [`example2.js`](https://raw.githubusercontent.com/apnex/vmw-sdk/master/examples/example2.js) above.

[`example4.js`](https://raw.githubusercontent.com/apnex/vmw-sdk/master/examples/example4.js): Display download groups for current product
```js
// load and create new client instance
const vmwClient = require('@apnex/vmw-sdk');
const vmw = new vmwClient();

// run
(async() => {
	try {
		// login to my.vmware.com
		await vmw.login({
			username: "my.username",
			password: "my.password"
		});

		// get and list file download groups for [ vmware_nsx_t_data_center ]
		let response = await vmw.getRelatedDLGList({
			category: 'networking_security',
			product: 'vmware_nsx_t_data_center',
			version: '3_x',
			dlgType: 'PRODUCT_BINARY'
		});
		/*=> {
			"dlgEditionsLists": [
				{
					"name": "VMware NSX Data Center Enterprise Plus",
					"dlgList": [
						{
							"name": "VMware NSX-T Data Center 3.0.1.1",
							"code": "NSX-T-30110",
							"releaseDate": "2020-07-16T07:00:00Z",
							"productId": "982",
							"releasePackageId": "48906",
							"orderId": 1
						},
						...
					]
				},
				...
			]
		}*/

		// print to console
		console.log(JSON.stringify(response, null, "\t"));
	} catch (error) {
		console.log(error.message);
	}
})();
```

---
##### .getDLGHeader
Retrieves file download groups for selected product

Type: `object`
```js
{
	downloadGroup: '<string>',
	productId: <integer>
}
```

**Note:** You can retrieve available `<downloadGroup>` and `<productId>` values by first calling `.getRelatedDLGList()`  
See [`example4.js`](https://raw.githubusercontent.com/apnex/vmw-sdk/master/examples/example4.js) above.

[`example5.js`](https://raw.githubusercontent.com/apnex/vmw-sdk/master/examples/example5.js): Display download groups for current product
```js
// load and create new client instance
const vmwClient = require('@apnex/vmw-sdk');
const vmw = new vmwClient();

// run
(async() => {
	try {
		// login to my.vmware.com
		await vmw.login({
			username: "my.username",
			password: "my.password"
		});

		// get download information for group [ NSX-T-30110 ]
		let response = await vmw.getDLGHeader({
			downloadGroup: 'NSX-T-30110',
			productId: 982
		});
		/*=> {
			"versions": [
				{
					"id": "NSX-T-30110",
					"name": "3.0.1.1",
					"isSelected": true
				}
			]
		}*/

		// print to console
		console.log(JSON.stringify(response, null, "\t"));
	} catch (error) {
		console.log(error.message);
	}
})();
```

---
##### .getDLGDetails
Retrieves available files for current download group

Type: `object`
```js
{
	downloadGroup: '<string>',
	productId: <integer>
}
```

**Note:** You can retrieve available `<downloadGroup>` and `<productId>` values by first calling `.getRelatedDLGList()`  
See [`example4.js`](https://raw.githubusercontent.com/apnex/vmw-sdk/master/examples/example4.js) above.

[`example6.js`](https://raw.githubusercontent.com/apnex/vmw-sdk/master/examples/example6.js): Get available file downloads
```js
// load and create new client instance
const vmwClient = require('@apnex/vmw-sdk');
const vmw = new vmwClient();

// run
(async() => {
	try {
		// login to my.vmware.com
		await vmw.login({
			username: "my.username",
			password: "my.password"
		});

		// get available files for group [ NSX-T-30110 ]
		let response = await vmw.getDLGDetails({
			downloadGroup: 'NSX-T-30110',
			productId: 982
		});
		/*=> {
			"eligibilityResponse": {
				"eligibleToDownload": true
			},
			"downloadFiles": [
				{
					"fileName": "nsx-unified-appliance-3.0.1.1.0.16556500.ova",
					"build": "16556497",
					"releaseDate": "2020-07-16",
					"fileType": "ova"
					...
				},
				...
			]
		}*/

		// print to console
		console.log(JSON.stringify(response, null, "\t"));
	} catch (error) {
		console.log(error.message);
	}
})();
```

---
##### .getDownload
Retrieve authenticated doanload URL for a specific file

Type: `object`
```js
{
	downloadGroup: '<string>',
	productId: <integer>
}
```

**Note:** You can retrieve available `<downloadGroup>` and `<productId>` values by first calling `.getRelatedDLGList()`  
See [`example4.js`](https://raw.githubusercontent.com/apnex/vmw-sdk/master/examples/example4.js) above.

[`example7.js`](https://raw.githubusercontent.com/apnex/vmw-sdk/master/examples/example7.js): Get available file downloads
```js
// load and create new client instance
const vmwClient = require('@apnex/vmw-sdk');
const vmw = new vmwClient();

// run
(async() => {
	try {
		// login to my.vmware.com
		await vmw.login({
			username: "my.username",
			password: "my.password"
		});

		// get available files for group [ NSX-T-30110 ]
		let response = await vmw.getDLGDetails({
			downloadGroup: 'NSX-T-30110',
			productId: 982
		});
		/*=> {
			"eligibilityResponse": {
				"eligibleToDownload": true
			},
			"downloadFiles": [
				{
					"fileName": "nsx-unified-appliance-3.0.1.1.0.16556500.ova",
					"build": "16556497",
					"releaseDate": "2020-07-16",
					"fileType": "ova"
					...
				},
				...
			]
		}*/

		// print to console
		console.log(JSON.stringify(response, null, "\t"));
	} catch (error) {
		console.log(error.message);
	}
})();
```

async getDownload(json) {
//async getMyLicensedProducts() {
