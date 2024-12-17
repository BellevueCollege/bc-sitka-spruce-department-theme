describe('DivisionHomepage', function () {

	//Note: "name" gives unique names for screenshots based on the screen size descriptor.
	const screenSizes = [
		//Mobile 414x896
		{
			width: 414,
			height: 896,
			name: 'mobile'
		},
		//Tablet 768x1024
		{
			width: 768,
			height: 1024,
			name: 'tablet'
		},
		//Desktop 1920x1080
		{
			width: 1920,
			height: 1080,
			name: 'desktop'
		}
	]

	// Navigates to the test page before testing begins
	before(browser => browser.navigateTo('https://bcqabackstopjs.kinsta.cloud/sitka-default/?cache=none'));

//FULL PAGE TEST
//Division Homepage- Tests for all Key elements
//home page-template-default REDO
	test('Full Division Homepage UI Results', function (browser) {
		//Iterates over each screen size, sets the browser window size, 
		//and performs the actions (e.g., wait, screenshot, assertion) for each size.
		screenSizes.forEach(screenSize => {
			browser
				.window.setSize(screenSize.width, screenSize.height)
				.waitForElementVisible('body')
				.assert.screenshotIdenticalToBaseline('body',`fullBody-${screenSize.name}`);
		});
	}); 

//HERO AREA & SITE INTRO TESTS★
//lead stuffs

//ANNOUNCEMENT BANNER TESTS
	test('Announcement Banner UI Results', function (browser) {
		/* Iterates over each screen size, sets the browser window size, 
		and performs the actions (e.g., wait, screenshot, assertion) for each size.*/
		screenSizes.forEach(screenSize => {
			browser
				.window.setSize(screenSize.width, screenSize.height)
				.waitForElementVisible('section.announcement')
				.assert.screenshotIdenticalToBaseline('section.announcement',`announcement-banner-${screenSize.name}`);
		});
	});

//CARDS SECTION
	test('Cards Section UI Results', function (browser) {
		screenSizes.forEach(screenSize => {
			browser
				.window.setSize(screenSize.width, screenSize.height)
				.waitForElementVisible('section.card-section')
				.waitForElementVisible('.section.card-section .card .card-img-top')
				.assert.screenshotIdenticalToBaseline('section.card-section',`card-section-${screenSize.name}`);
		});
	});

//LISTING SECTION
	test('Listing Section UI Results', function (browser) {
		screenSizes.forEach(screenSize => {
			browser
				.window.setSize(screenSize.width, screenSize.height)
				.waitForElementVisible('section.listing-section-wrapper')
				.assert.screenshotIdenticalToBaseline('section.listing-section-wrapper',`listing-section-wrapper-${screenSize.name}`);
		});
	});

//DIFFERENTIATOR SECTION -BEL02
	test('Differentiator Section UI Results', function (browser) {
		screenSizes.forEach(screenSize => {
			browser
				.window.setSize(screenSize.width, screenSize.height)
				.pause(1000)
				.waitForElementVisible('section.diffs')
				.assert.screenshotIdenticalToBaseline('section.diffs',`diffs-${screenSize.name}`);
		});
	}); 

//CHECKERBOARDS -BEL02
	test('Checkerboard Section UI Results', function (browser) {
		screenSizes.forEach(screenSize => {
			browser
				.window.setSize(screenSize.width, screenSize.height)
				.waitForElementVisible('section.checkerboard')
				.assert.screenshotIdenticalToBaseline('section.checkerboard',`checkerboard-${screenSize.name}`);
		});
	}); 
//PROFILES SECTION
	test('Profiles Section UI Results', function (browser) {
		screenSizes.forEach(screenSize => {
			browser
				.window.setSize(screenSize.width, screenSize.height)
				.waitForElementVisible('section.profiles-section-wrapper')
				.assert.screenshotIdenticalToBaseline('section.profiles-section-wrapper',`profiles-section-wrapper-${screenSize.name}`);
		});
	});
//BODY SECTION
	test('Body Section UI Results', function (browser) {
		screenSizes.forEach(screenSize => {
			browser
				.window.setSize(screenSize.width, screenSize.height)
				.waitForElementVisible('section.body-section-wrapper')
				.assert.screenshotIdenticalToBaseline('section.body-section-wrapper',`body-section-wrapper-${screenSize.name}`);
		});
	});
//NEWS FEATURE
	test('News Feature UI Results', function (browser) {
		screenSizes.forEach(screenSize => {
			browser
				.window.setSize(screenSize.width, screenSize.height)
				.waitForElementVisible('section.news-feature')
				.assert.screenshotIdenticalToBaseline('section.news-feature',`news-feature-${screenSize.name}`);
		});
	});
//EVENTS FEATURE



// CLOSING BROWSER/ END TESTS	
	after(browser => browser.end());
});

