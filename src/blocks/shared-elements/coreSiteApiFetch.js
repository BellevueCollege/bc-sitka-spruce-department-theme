import apiFetch from '@wordpress/api-fetch';


/**
 * Fetch all pages from a WordPress REST API endpoint.
 *
 * @param {string} url - URL of the endpoint.
 * @param {number} page - Page number to fetch. Defaults to 1.
 * @param {array} data - Array to store the data. Defaults to an empty array.
 * @return {Promise} The promise resolves with the final array of data.
 */
const fetchAllPages = async ( url, page = 1, data = [] ) => {

	try {
		const restUrl = url + `&page=${page}`;
		const result = await fetch( restUrl );
		if ( ! result.ok ) {
			throw new Error( `Response status: ${response.status}` );
		}

		// Get the total pages from the header.
		const pages = result.headers.get( 'X-WP-TotalPages' );

		// Add the data from this page to the array.
		data.push( ...( await result.json() ) );

		// If there are more pages, call the function again.
		if ( page < pages ) {
			await fetchAllPages( url, page + 1, data );
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
const coreSiteApiFetch = async path => {
	try {
		const siteInfo = await apiFetch( { path: '/bc-sitka-spruce/v1/site-info' } );
		const restUrl = await siteInfo.network_url + path + '?per_page=100';
		const data = await fetchAllPages( restUrl );
		return data;
	} catch ( error ) {
		console.warn( 'Error: ', error );
	}
};

export default coreSiteApiFetch;
