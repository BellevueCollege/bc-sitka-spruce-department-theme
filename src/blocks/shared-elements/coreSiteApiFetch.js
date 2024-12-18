import apiFetch from '@wordpress/api-fetch';


/**
 * Fetch all pages from a WordPress REST API endpoint.
 *
 * @param {string} url - URL of the endpoint.
 * @param {number} page - Page number to fetch. Defaults to 1.
 * @param {array} data - Array to store the data. Defaults to an empty array.
 * @return {Promise} The promise resolves with the final array of data.
 */
const fetchPage = async ( url, allPages = false, page = 1, data = [] ) => {

	try {
		const restUrl = url;
		restUrl.searchParams.append( 'page', page );
		const result = await fetch( restUrl );
		if ( ! result.ok ) {
			throw new Error( `Response status: ${response.status}` );
		}

		// Get the total pages from the header.
		const pages = result.headers.get( 'X-WP-TotalPages' );

		const resultJson = await result.json();

		// Not an array? Return the data.
		if ( ! Array.isArray( resultJson ) ) {
			return resultJson;
		}
		// Add the data from this page to the array.
		data.push( ...( resultJson ) );

		// If there are more pages, call the function again.
		if ( allPages && ( page < pages ) ) {
			await fetchPage( url, true, page + 1, data );
		}
		return data;

	} catch ( error ) {
		console.warn( 'Error: ', error );
	}
};

/**
 * Fetch Data from the Core Network Site API
 *
 * @param {string} path - URL of the endpoint.
 * @return {Promise} The promise resolves with the final array of data.
 */
const coreSiteApiFetch = async ( path, allPages = true )=> {
	try {
		const siteInfo = await apiFetch( { path: '/bc-sitka-spruce/v1/site-info' } );
		let restUrl = await new URL( siteInfo.network_url + path );

		if ( allPages ) {
			restUrl.searchParams.append( 'per_page', 100 );
			// console.log( 'coreSiteApiFetch: Fetching ALL data from ', restUrl.href );
		} else {
			// console.log( 'coreSiteApiFetch: Fetching data from ', restUrl.href );
		}
		const data = await fetchPage( restUrl, allPages );
		// console.log( `Data from ${restUrl}`, data );
		return data;
	} catch ( error ) {
		console.warn( 'Error: ', error );
	}
};

export default coreSiteApiFetch;
