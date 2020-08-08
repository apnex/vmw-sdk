## vmw-sdk
A promises-based Node.JS SDK for programmatic access to **my.vmware.com**

This SDK implements a login workflow and provides a structured wrapper for REST API calls.

## Highlights
- [Promise API](#api)
- [Stream API](#streams)
- [Pagination API](#pagination)

### Install
```
$ npm install @apnex/vmw-sdk
```

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
		//=> '[ { name: "VMware vSphere", actions: [ ... ] } ]'

	} catch (error) {
		console.log(error.message);
	}
})();
```
### API Methods

##### .getProducts
```js
const vmwClient = require('@apnex/vmw-sdk');

(async() => {
	// create new client instance
	const vmw = new vmwClient();

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
		//=> '[ { name: "VMware vSphere", actions: [ ... ] } ]'

	} catch (error) {
		console.log(error.message);
	}
})();
```
