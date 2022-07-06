#!/usr/bin/env node
import got from 'got';
import { CookieJar } from 'tough-cookie';

// Provides direct interface against customerconnect.vmware.com API
// Provides an ability to login
// Does not provide external auth persistence
// Does not implement caching or throttling
// Returns raw API responses, no UI rendering

export default class vmwSdk {
	constructor(options = {}) {
                this.options = options;
		if(typeof(options.cookieJar) !== 'undefined') {
			this.cookieJar = options.cookieJar;
		} else {
			this.cookieJar = new CookieJar();
		}
		this.base = got.extend({ // client defaults
			cookieJar: this.cookieJar,
			mutableDefaults: true,
			https: {
				rejectUnauthorized: true
			},
			hooks: {
				afterResponse: [
					(response, retryWithMergedOptions) => {
						if (response.statusCode === 401) { // Unauthorized
							let error = new Error('[ERROR]: Session timed out - Please reauthenticate');
							error.code = 401;
							throw error;
						} else if (response.statusCode === 403) { // Forbidden
							//console.log(response.body);
							let error = new Error('[ERROR]: Access denied - try again later');
							error.code = 403;
							throw error;
						} else if (response.statusCode === 400) { // Bad Request
							//console.log(response.body);
							let error = new Error('[ERROR]: Something went wrong?');
							error.code = 400;
							throw error;
						} else {
							//console.log(response);
							return response;
						}
					}
				],
				beforeRedirect: [
					(options, response) => { // throw Error if credentials fail
						if(new RegExp('errorCode=AUTH-ERR', 'g').exec(response.redirectUrls[0])) {
							throw new Error('[ERROR]: AUTH-ERROR please check environment variables [ $VMWUSER ] and [ $VMWPASS ] are correct and try again!');
						}
					}
				],
				beforeRequest: [
					(options, response) => {
						console.error('[' + options.method + '] ' + options.url.origin + options.url.pathname);
					}
				]
			}
		});
		this.client = this.base.extend({
			prefixUrl: 'https://customerconnect.vmware.com/'
		});
	}
	async login(options) {
		// step 1 - Ingest cookies from landing sequence
		this.cookieJar.removeAllCookiesSync();
		await this.base.get('https://customerconnect.vmware.com/web/vmware/login');

		// step 2 - Post creds for Auth
		let body = await this.base.post('https://auth.vmware.com/oam/server/auth_cred_submit', {
			searchParams: new URLSearchParams([
				['Auth-AppID', 'WMVMWR']
			]),
			headers: {
				'content-type': 'application/x-www-form-urlencoded'
			},
			form: {
				username: options.username,
				password: options.password
			}
		}).text();

		// strip whitespace and extract SAMLRequest string
		let found = body.replace(/\r?\n|\r/g, "").match(/NAME="SAMLResponse" VALUE="(.+)"/);
		let SAMLResponse;
		if(found[1]) {
			SAMLResponse = found[1];
		}

		// step 3 - post SSO request
		await this.base.post('https://customerconnect.vmware.com/vmwauth/saml/SSO', {
			headers: {
				'content-type': 'application/x-www-form-urlencoded'
			},
			form: { SAMLResponse }
		});

		// step 4 - get XSRF-TOKEN token and set in client header
		let headers;
		this.cookieJar.getCookies('https://customerconnect.vmware.com', (err, cookies) => {
			headers = {
				'X-XSRF-TOKEN': cookies.filter((cookie) => {
					return (cookie.key == 'XSRF-TOKEN');
				})[0].value
			};
			this.client = this.base.extend({ // update default client options
				prefixUrl: 'https://customerconnect.vmware.com/',
				headers
			});
		});

		return headers;
		// other links
		//https://customerconnect.vmware.com/web/vmware/checksession
		//https://customerconnect.vmware.com/vmwauth/loggedinuser
		//https://customerconnect.vmware.com/channel/api/v1.0/evals/active
		//https://customerconnect.vmware.com/channel/api/v1.0/sdp/services
		//https://customerconnect.vmware.com/group/vmware/extend_session
	}
	async accountInfo() {
		return this.client.post('channel/api/v1.0/ems/accountinfo', {
			headers: {
				'Accept': 'application/json, text/plain, */*'
			},
			json: {
				"rowLimit": "3"
			}
		}).json();
	}
	async getProducts() {
		let params = {
			'isPrivate': 'true'
		}
		return this.client.get('channel/public/api/v1.0/products/getProductsAtoZ', {
			searchParams: new URLSearchParams(Object.entries(params))
		}).json();
	}
	async getProductHeader(params) {
		return this.client.get('channel/public/api/v1.0/products/getProductHeader', {
			searchParams: new URLSearchParams(Object.entries(params))
		}).json();
	}
	async getRelatedDLGList(params) {
		return this.client.get('channel/public/api/v1.0/products/getRelatedDLGList', {
			searchParams: new URLSearchParams(Object.entries(params))
		}).json();
	}
	async getDLGHeader(params) {
		return this.client.get('channel/public/api/v1.0/products/getDLGHeader', {
			searchParams: new URLSearchParams(Object.entries(params))
		}).json();
	}
	async getDLGDetails(params) {
		return this.client.get('channel/api/v1.0/dlg/details', {
			searchParams: new URLSearchParams(Object.entries(params))
		}).json();
	}
	async eulaAccept(params) {
		return this.client.get('channel/api/v1.0/dlg/eula/accept', {
			searchParams: new URLSearchParams(Object.entries(params))
		}).json();
	}
	async getMyLicensedProducts() {
		return this.client.post('channel/api/v1.0/products/getMyLicensedProducts');
	}
	async getDownload(json) {
		return this.client.post('channel/api/v1.0/dlg/download', {json}).json();
	}
};
