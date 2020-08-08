## vmw-sdk
A promises-based Node.JS SDK for programmatic access to **my.vmware.com**

This SDK implements a login workflow and provides a structured wrapper for REST API calls.

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

example1.js: Display current account info
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

example2.js: Get product list and build a download index
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

**Note:** You can retrieve available `<category>`,`<product>` and `<version>` values by first calling .getProducts()  
See **example2.js** above

example3.js: Display specific product version information
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

	async getRelatedDLGList(params) {
	async getDLGHeader(params) {
	async getDLGDetails(params) {
	async eulaAccept(params) {
	async getMyLicensedProducts() {
	async getDownload(json) {
