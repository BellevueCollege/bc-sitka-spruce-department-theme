import { test, expect } from '../fixtures/test.js';
import {
	prepareAdjacencyScreenshot,
	visitIntegrationPage,
} from '../helpers/page-integration.js';
import { settleLocatorForScreenshot } from '../helpers/editor.js';
import { seedIntegrationData, seedSiteChromeData } from '../helpers/wp-cli.js';

/** High-risk scenarios that get desktop @visual baselines. */
const VISUAL_SCENARIOS = [
	'white-to-xlight',
	'white-to-rainy',
	'white-to-arch',
	'xlight-to-xlight',
	'rainy-to-rainy',
	'xlight-to-differentiator',
	'brutus-to-differentiator',
	'accent-to-differentiator',
	'rainy-to-differentiator',
	'differentiator-to-rainy',
	'differentiator-to-differentiator',
	'white-to-support-feature',
];

let pageUrl;

test.describe( 'Section adjacency integration', () => {
	test.beforeAll( () => {
		seedSiteChromeData();
		const seed = seedIntegrationData();
		pageUrl = seed.sectionAdjacencyPageUrl;
	} );

	test.beforeEach( async ( { page } ) => {
		await visitIntegrationPage( page, pageUrl );
	} );

	test( 'uses the no-sidebar template without nav sidebar', async ( { page } ) => {
		await expect( page.locator( '.nav-sidebar' ) ).toHaveCount( 0 );
		await expect(
			page.getByRole( 'heading', { name: 'E2E Section Adjacency' } )
		).toBeVisible();
	} );

	test( 'white section hides divider before colored or arch siblings', async ( {
		page,
	} ) => {
		await expectDividerHidden( page, 'e2e-adj-scenario-white-to-xlight' );
		await expectDividerHidden( page, 'e2e-adj-scenario-white-to-accent' );
		await expectDividerHidden( page, 'e2e-adj-scenario-white-to-brutus' );
		await expectDividerHidden( page, 'e2e-adj-scenario-white-to-rainy' );
		await expectDividerHidden( page, 'e2e-adj-scenario-white-to-arch' );
		await expectDividerHidden( page, 'e2e-adj-scenario-white-to-support-feature' );
	} );

	test( 'same-color section pairs keep adjacent section structure', async ( {
		page,
	} ) => {
		const xlightPair = page.locator( '#e2e-adj-scenario-xlight-to-xlight' );
		await expect( xlightPair.locator( '.section-xlight' ) ).toHaveCount( 2 );
		await expect(
			xlightPair.locator( '.section-xlight + .section-xlight' )
		).toBeVisible();

		const rainyPair = page.locator( '#e2e-adj-scenario-rainy-to-rainy' );
		await expect(
			rainyPair.locator( '.section-rainy-night-blue' )
		).toHaveCount( 2 );
		await expect(
			rainyPair.locator(
				'.section-rainy-night-blue + .section-rainy-night-blue'
			)
		).toBeVisible();
		await expect( rainyPair.locator( '.media-gallery-wrapper' ) ).toBeVisible();
	} );

	test( 'arch overlap and suppression follow previous section color', async ( {
		page,
	} ) => {
		await expectVisibleArchAfterSection(
			page,
			'e2e-adj-scenario-xlight-to-differentiator',
			'.section-xlight'
		);
		await expectVisibleArchAfterSection(
			page,
			'e2e-adj-scenario-brutus-to-differentiator',
			'.section-brutus-blue'
		);
		await expectVisibleArchAfterSection(
			page,
			'e2e-adj-scenario-accent-to-differentiator',
			'.section-accent-blue-extralight'
		);
		await expectVisibleArchAfterSection(
			page,
			'e2e-adj-scenario-white-to-arch',
			'.section-white'
		);
		await expectVisibleArchAfterSection(
			page,
			'e2e-adj-scenario-white-to-support-feature',
			'.section-white'
		);

		const rainyToDiff = page.locator(
			'#e2e-adj-scenario-rainy-to-differentiator'
		);
		const suppressedArch = rainyToDiff.locator(
			'.section-rainy-night-blue + .arch-shape'
		);
		await expect( suppressedArch ).toBeAttached();
		await expect( suppressedArch ).toBeHidden();
	} );

	test( 'curved differentiator stacks keep rainy neighbors', async ( { page } ) => {
		const toRainy = page.locator( '#e2e-adj-scenario-differentiator-to-rainy' );
		await expect( toRainy.locator( '.arch-shape' ) ).toHaveCount( 1 );
		await expect( toRainy.locator( '.diffs.curved-top' ) ).toBeVisible();
		await expect( toRainy.locator( '.tabs-section-component' ) ).toBeVisible();

		const toDiff = page.locator(
			'#e2e-adj-scenario-differentiator-to-differentiator'
		);
		await expect( toDiff.locator( '.arch-shape' ) ).toHaveCount( 2 );
		await expect( toDiff.locator( '.diffs.curved-top' ) ).toHaveCount( 2 );
	} );

	for ( const scenarioId of VISUAL_SCENARIOS ) {
		test( `scenario ${ scenarioId } snapshot @visual`, async ( {
			page,
		}, testInfo ) => {
			if ( testInfo.project.name !== 'desktop' ) {
				testInfo.skip( true, 'Section adjacency visuals are desktop-only.' );
			}

			await prepareAdjacencyScreenshot( page );
			const scenario = page.locator( `#e2e-adj-scenario-${ scenarioId }` );
			await expect( scenario ).toBeAttached();
			await scenario.scrollIntoViewIfNeeded();
			await settleLocatorForScreenshot( scenario );
			await expect( scenario ).toHaveScreenshot(
				`section-adjacency-${ scenarioId }.png`,
				{ maxDiffPixelRatio: 0.02 }
			);
		} );
	}
} );

/**
 * @param {import('@playwright/test').Page} page
 * @param {string} scenarioId
 */
async function expectDividerHidden( page, scenarioId ) {
	const scenario = page.locator( `#${ scenarioId }` );
	const whiteSection = scenario.locator( '.section-white' ).first();
	await expect( whiteSection ).toBeVisible();
	await expect( whiteSection.locator( '.section-divider' ) ).toBeHidden();
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {string} scenarioId
 * @param {string} previousSectionSelector
 */
async function expectVisibleArchAfterSection(
	page,
	scenarioId,
	previousSectionSelector
) {
	const scenario = page.locator( `#${ scenarioId }` );
	const arch = scenario.locator( `${ previousSectionSelector } + .arch-shape` );
	await expect( arch ).toBeVisible();
	await expect(
		scenario.locator( '.section-rainy-night-blue.curved-top' ).first()
	).toBeVisible();
}
