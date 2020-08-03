#!/usr/bin/env node
'use strict';
const vmwClient = require('./vmw.sdk');
const fs = require('fs');

// ignore self-signed certificate
//process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
const params = require('./params.json');
var username = params.username;
var password = params.password;

// colours
const chalk = require('chalk');
const red = chalk.bold.red;
const orange = chalk.keyword('orange');
const green = chalk.green;
const blue = chalk.blueBright;

// called from shell
const args = process.argv;
if(args[1].match(/product/g)) {
	main();
}

// main
async function main(id) {
	// login to my.vmware.com
	let client = new vmwClient(); // return 'configured' client
	//let client = new vmwClient(); // testing calls without auth

	try {
		// login
		await client.login({username, password}); // perform login // return authenticated instance?

		// display data
		//let result = await getProducts(client);
		let result = await getProductHeader(client);
		//let result = await getRelatedDLGList(client);
		//let result = await getDLGHeader(client);
		//let result = await getDLGDetails(client);
		console.log(JSON.stringify(result, null, "\t"));
		//listProducts(result);

		// save data
		//fs.writeFileSync('./productIndex.json', JSON.stringify(result, null, "\t"), 'utf8');
	} catch(error) {
		console.log(error.message);
	}
}

async function listProducts(result) {
	// output list
	result.forEach((item) => {
		console.log(item.product);
	});
}

async function getProducts(client) {
	let result = [];
	return client.getProducts().then((products) => {
		let links = products.productCategoryList[0].productList;
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
			//dlgTypes//
			//DRIVERS_TOOLS
			//OPEN_SOURCE
			//CUSTOM_ISO
			//ADDONS
		});
		return result;
	});
}

async function getProductHeader(client, productName) {
	return client.getProductHeader({
		category: 'networking_security',
		product: 'vmware_nsx_t_data_center',
		version: '3_x'
	});
}

async function getRelatedDLGList(client, productName) {
	let products = await getProducts(client);
	let product = products.filter((item) => {
		return (item.product == 'vmware_nsx_t_data_center');
	})[0];
	return client.getRelatedDLGList({
		category: product.category,
		product: product.product,
		version: product.version,
		dlgType: product.dlgType
	});
}

async function getDLGHeader(client, productName) {
	return client.getDLGHeader({
		downloadGroup: 'NSX-T-30110',
		productId: 982
	});
}

async function getDLGDetails(client, productName) {
	// requires AUTH 401 unauthorized
	return client.getDLGDetails({
		downloadGroup: 'NSX-T-30110',
		productId: 982
	});
}
