import apiFetch from '@wordpress/api-fetch';
const coreSiteApiFetch = async path => {
	try {
		const siteInfo = await apiFetch( { path: '/bc-sitka-spruce/v1/site-info' } );
		const restUrl = await siteInfo.network_url + path;
		const result = await fetch( restUrl );
		const data = await result.json();
		return data;
	} catch ( error ) {
		console.warn( 'Error: ', error );
	}
};

export default coreSiteApiFetch;
