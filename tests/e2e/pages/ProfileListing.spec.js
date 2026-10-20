import { test, expect } from '../fixtures/test.js';
import {
	expectFullPageScreenshot,
	runAxeOnSelector,
	visitIntegrationPage,
} from '../helpers/page-integration.js';
import { skipDuplicateBlockViewport } from '../helpers/viewports.js';
import { seedIntegrationData, seedSiteChromeData } from '../helpers/wp-cli.js';

/** OHO Views shows 10 profiles per page; fixtures must exceed that. */
const MINIMUM_PROFILES_FOR_PAGINATION = 11;

/** Matches e2e_get_profile_listing_fixtures() in the integration seed. */
const SEEDED_PROFILE_COUNT = 12;

const PROFILE_RESULTS = '.profile-results';
const PROFILE_PAGINATION = 'Pagination';
const SHARED_LAST_NAME_INITIAL = 'L';

let listingUrl;
let profileUrl;

test.describe( 'Profile listing integration', () => {
	test.beforeAll( () => {
		seedSiteChromeData();
		const seed = seedIntegrationData();
		listingUrl = seed.profileListingUrl;
		profileUrl = seed.profileUrl;
	} );

	test.beforeEach( async ( { page } ) => {
		await visitIntegrationPage( page, listingUrl );
	} );

	test( 'renders OHO listing results without empty-state message', async ( { page } ) => {
		const results = page.locator( PROFILE_RESULTS );
		await expect( results ).toBeVisible();
		await expect( page.getByText( 'No people matching your search.' ) ).toHaveCount( 0 );
		await expect( page.getByText( 'Our Faculty and Staff' ) ).toHaveCount( 0 );
		expect( SEEDED_PROFILE_COUNT ).toBeGreaterThanOrEqual( MINIMUM_PROFILES_FOR_PAGINATION );
		await expect( page.locator( PROFILE_RESULTS ) ).toContainText(
			`of ${ SEEDED_PROFILE_COUNT } profiles`
		);
	} );

	test( 'shows search filters and profile links in listing results', async ( { page } ) => {
		await expect( page.getByLabel( 'Search by Name' ) ).toBeVisible();
		await expect( page.getByRole( 'combobox', { name: 'Office or Department' } ) ).toBeVisible();
		await expect( page.getByText( 'Profile Type' ) ).toBeVisible();

		const profileLink = page
			.locator( PROFILE_RESULTS )
			.getByRole( 'link', { name: /Ada Lovelace/i } );
		await expect( profileLink.first() ).toBeVisible();
		await profileLink.first().click();
		await expect( page ).toHaveURL(
			new RegExp( profileUrl.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' ) )
		);
	} );

	test( 'paginates when more than ten profiles are published', async ( { page } ) => {
		const pagination = page.getByRole( 'navigation', { name: PROFILE_PAGINATION } );
		await expect( pagination ).toBeVisible();
		await pagination.getByRole( 'link', { name: /page 2/i } ).click();
		await expect(
			page.locator( PROFILE_RESULTS ).getByRole( 'heading', { name: /No Photo/i } )
		).toBeVisible();
	} );

	test( 'pins one profile and groups the rest by last-name initial', async ( { page } ) => {
		const results = page.locator( PROFILE_RESULTS );
		await expect( page.locator( '.pinned-profile' ) ).toHaveCount( 1 );
		await expect(
			page.locator( '.pinned-profile' ).getByRole( 'link', { name: /Ada Lovelace/i } )
		).toBeVisible();
		await expect( page.locator( '.listing__set' ).first() ).toBeVisible();
		await expect(
			results.getByRole( 'heading', { name: SHARED_LAST_NAME_INITIAL, level: 2 } )
		).toBeVisible();
		await expect( results.getByRole( 'heading', { name: /Sam Larson/i } ) ).toBeVisible();
		await expect( results.getByRole( 'heading', { name: /Mei Liu/i } ) ).toBeVisible();
	} );

	test( 'lists both departments and the three profile types', async ( { page } ) => {
		const departmentFilter = page.getByRole( 'combobox', { name: 'Office or Department' } );
		await expect( departmentFilter.getByRole( 'option', { name: 'E2E Department' } ) ).toBeAttached();
		await expect( departmentFilter.getByRole( 'option', { name: 'E2E Advising Office' } ) ).toBeAttached();
		await expect( page.getByRole( 'checkbox', { name: 'Administration', exact: true } ) ).toBeVisible();
		await expect( page.getByRole( 'checkbox', { name: 'Faculty', exact: true } ) ).toBeVisible();
		await expect( page.getByRole( 'checkbox', { name: 'Staff', exact: true } ) ).toBeVisible();
		await expect( page.getByRole( 'checkbox', { name: 'E2E Faculty', exact: true } ) ).toHaveCount( 0 );
	} );

	test( 'filters the directory by staff profile type', async ( { page } ) => {
		await page.getByRole( 'checkbox', { name: 'Staff', exact: true } ).check();
		await page.getByRole( 'button', { name: 'Submit Search' } ).click();
		const results = page.locator( PROFILE_RESULTS );
		await expect( results.getByRole( 'heading', { name: /Quinn Foster/i } ) ).toBeVisible();
		await expect( results.getByRole( 'heading', { name: /Ada Lovelace/i } ) ).toHaveCount( 0 );
	} );

	test( 'shows contact details on pinned and unpinned rows when set', async ( { page } ) => {
		const pinnedProfile = page.locator( '.pinned-profile' );
		await expect( pinnedProfile.getByRole( 'link', { name: 'ada.lovelace@example.com' } ) ).toBeVisible();
		await expect( pinnedProfile.getByRole( 'link', { name: '425-564-0001' } ) ).toBeVisible();
		await expect( pinnedProfile.getByRole( 'link', { name: 'Book E2E Appointment' } ) ).toBeVisible();

		const unpinnedWithContact = page.locator( '.listing__set' ).filter( {
			has: page.getByRole( 'heading', { name: /Pat Alvarez/i } ),
		} );
		await expect( unpinnedWithContact.getByRole( 'link', { name: 'pat.alvarez@example.com' } ) ).toBeVisible();
		await expect( unpinnedWithContact.getByRole( 'link', { name: '425-564-0102' } ) ).toBeVisible();
		await expect( unpinnedWithContact.getByRole( 'link', { name: 'Book with Pat' } ) ).toBeVisible();

		const unpinnedWithoutContact = page.locator( '.listing__set' ).filter( {
			has: page.getByRole( 'heading', { name: /Marie Curie/i } ),
		} );
		await expect( unpinnedWithoutContact.getByRole( 'link', { name: /@/ } ) ).toHaveCount( 0 );
		await expect( unpinnedWithoutContact.locator( 'a[href^="tel:"]' ) ).toHaveCount( 0 );
		await expect( unpinnedWithoutContact.getByRole( 'link', { name: /Book/i } ) ).toHaveCount( 0 );
	} );

	test( 'shows uploaded photos and the default profile image', async ( { page } ) => {
		const results = page.locator( PROFILE_RESULTS );
		await expect( results.locator( 'img[src*="basic-img.svg"]' ).first() ).toBeVisible();
		await expect( results.locator( 'img:not([src*="basic-img.svg"])' ).first() ).toBeVisible();
	} );

	test( 'frontend aria snapshot @aria', async ( { page }, testInfo ) => {
		skipDuplicateBlockViewport( testInfo );
		await expect( page.locator( 'body' ) ).toMatchAriaSnapshot( {
			name: 'profile-listing-frontend.yml',
		} );
	} );

	test( 'listing region passes axe', async ( { page } ) => {
		const results = await runAxeOnSelector(
			page,
			'.profile-listing-page .profile-results, #oho-views-results-profile-listing'
		);
		expect( results.violations ).toEqual( [] );
	} );

	test( 'full page snapshot @visual', async ( { page } ) => {
		await expectFullPageScreenshot( page, 'profile-listing-full.png' );
	} );
} );
