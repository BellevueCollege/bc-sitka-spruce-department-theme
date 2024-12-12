describe('Flexiblepage', function () {
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
	before(browser => browser.navigateTo('https://bcqabackstopjs.kinsta.cloud/sitka-default/flexible-page-test/'));

//FULL PAGE TEST [No adjustments needed]
	test('Full Flexibile page UI Results', function (browser) {
		//Iterates over each screen size, sets the browser window size, 
		//and performs the actions (e.g., wait, screenshot, assertion) for each size.
		screenSizes.forEach(screenSize => {
			browser
				.window.setSize(screenSize.width, screenSize.height)
				.waitForElementVisible('body')
				.assert.screenshotIdenticalToBaseline('body',`Fullpage-${screenSize.name}`);
		});
	}); 

//HERO AREA & SITE INTRO TESTS★ [WIP]
//class="container-xl flexible-page-intro"
test('Flexibile page Hero Area & Site Intro UI Results', function (browser) {
	//Iterates over each screen size, sets the browser window size, 
	//and performs the actions (e.g., wait, screenshot, assertion) for each size.
	screenSizes.forEach(screenSize => {
		browser
			.window.setSize(screenSize.width, screenSize.height)
			.waitForElementVisible('flexible-page-intro')
			.assert.screenshotIdenticalToBaseline('flexible-page-intro',`HeroIntro-${screenSize.name}`);
	});
}); 

//LEAD/INTRO TEST [WIP]
//class="wp-block-mayflower-blocks-lead lead"
test('Intro UI Results', function (browser) {
	/* Iterates over each screen size, sets the browser window size, 
	and performs the actions (e.g., wait, screenshot, assertion) for each size.*/
	screenSizes.forEach(screenSize => {
		browser
			.window.setSize(screenSize.width, screenSize.height)
			.waitForElementVisible('wp-block-bc-sitka-spruce-narrow-content narrow-content')
			.assert.screenshotIdenticalToBaseline('wp-block-bc-sitka-spruce-narrow-content narrow-content',`lead/intro-${screenSize.name}`);
	});
});


//HEADING TEST [No Adjustments needed]
test('Heading Block UI Results', function (browser) {
	/* Iterates over each screen size, sets the browser window size, 
	and performs the actions (e.g., wait, screenshot, assertion) for each size.*/
	screenSizes.forEach(screenSize => {
		browser
			.window.setSize(screenSize.width, screenSize.height)
			.waitForElementVisible('.wp-block-heading')
			.assert.screenshotIdenticalToBaseline('.wp-block-heading',`Heading-block-${screenSize.name}`);
	});
});

//LIST TEST [No Adjustments needed]
test('List Block UI Results', function (browser) {
	/* Iterates over each screen size, sets the browser window size, 
	and performs the actions (e.g., wait, screenshot, assertion) for each size.*/
	screenSizes.forEach(screenSize => {
		browser
			.window.setSize(screenSize.width, screenSize.height)
			.waitForElementVisible('.wp-block-list')
			.assert.screenshotIdenticalToBaseline('.wp-block-list',`List-block-${screenSize.name}`);
	});
});

//BLOCK QUOTE TEST[WIP- buggy]
//class="wp-block-quote is-layout-flow wp-block-quote-is-layout-flow"
test('Quote Block UI Results', function (browser) {
	/* Iterates over each screen size, sets the browser window size, 
	and performs the actions (e.g., wait, screenshot, assertion) for each size.*/
	screenSizes.forEach(screenSize => {
		browser
			.window.setSize(screenSize.width, screenSize.height)
			.waitForElementVisible('.wp-block-quote')
			.assert.screenshotIdenticalToBaseline('.wp-block-quote',`Quote-block-${screenSize.name}`);
	});
});

//CODE BLOCK TEST
//class="wp-block-code"
test('Code Block UI Results', function (browser) {
	/* Iterates over each screen size, sets the browser window size, 
	and performs the actions (e.g., wait, screenshot, assertion) for each size.*/
	screenSizes.forEach(screenSize => {
		browser
			.window.setSize(screenSize.width, screenSize.height)
			.waitForElementVisible('.wp-block-code')
			.assert.screenshotIdenticalToBaseline('.wp-block-code',`Code-block-${screenSize.name}`);
	});
});


	//DETAILS BLOCK
	//wp-block-details is-layout-flow wp-block-details-is-layout-flow
test('Details Block UI Results', function (browser) {
	/* Iterates over each screen size, sets the browser window size, 
	and performs the actions (e.g., wait, screenshot, assertion) for each size.*/
	screenSizes.forEach(screenSize => {
		browser
			.window.setSize(screenSize.width, screenSize.height)
			.waitForElementVisible('.wp-block-details')
			.assert.screenshotIdenticalToBaseline('.wp-block-details',`Details-block-${screenSize.name}`);
	});
});
	//PREFORMATTED BLOCK TEST
	//class="wp-block-preformatted"

	//TABLE TEXT
	//class="wp-block-table"

	//CLAssIC BLOCK VISUAl TEST CANNOT BE MADE- EDITOR ONLY

//CARDS SECTION [No Adjustments needed]
test('Cards Section UI Results', function (browser) {
	screenSizes.forEach(screenSize => {
		browser
			.window.setSize(screenSize.width, screenSize.height)
			.waitForElementVisible('section.card-section')
			.waitForElementVisible('.section.card-section .card .card-img-top')
			.assert.screenshotIdenticalToBaseline('section.card-section',`card-section-${screenSize.name}`);
	});
});

//APPLICATION STEPS
//application-steps-component section section-xlight

//TABS SECTION
//section section-dark tabs-section-component dark-bg bg-navy

//ACCORDION SECTION
//accordion-section-content col-md-8

//CALLOUT 
//class="callout-wrapper col"

//LISTING SECTION [No adjustments needed]
//class="section section-xlight listing-section-wrapper"
test('Listing Section UI Results', function (browser) {
	screenSizes.forEach(screenSize => {
		browser
			.window.setSize(screenSize.width, screenSize.height)
			.waitForElementVisible('section.listing-section-wrapper')
			.assert.screenshotIdenticalToBaseline('section.listing-section-wrapper',`listing-section-wrapper-${screenSize.name}`);
	});
});


//COURSE & CRED REQUIREMENTS
//class="course-information-section-wrapper section section-xlight"


//BODY SECTION [No Adjustments needed]
test('Body Section UI Results', function (browser) {
	screenSizes.forEach(screenSize => {
		browser
			.window.setSize(screenSize.width, screenSize.height)
			.waitForElementVisible('section.body-section-wrapper')
			.assert.screenshotIdenticalToBaseline('section.body-section-wrapper',`body-section-wrapper-${screenSize.name}`);
	});
});

//BIO SECTION
//class="bio-section-wrapper section section-white"

//CONTACT SECTION
//class="section section-accent-blue-extralight contact-section container-fluid"

//TESTIMONIAL SECTION
//class="section section-xlight testimonial-section-wrapper"


//ANNOUNCEMENT BANNER TESTS [No Adjustments needed]
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

//MEDIA GALLERY
//class="media-gallery-wrapper section section-dark text-white swiper container-fluid"

//PROFILE SECTION [No Adjustments needed]
test('Profiles Section UI Results', function (browser) {
	screenSizes.forEach(screenSize => {
		browser
			.window.setSize(screenSize.width, screenSize.height)
			.waitForElementVisible('section.profiles-section-wrapper')
			.assert.screenshotIdenticalToBaseline('section.profiles-section-wrapper',`profiles-section-wrapper-${screenSize.name}`);
	});
});

//DEGREE & CERT SECTION 
//class="degrees-certificates-section-wrapper section section-dark text-white"


//CHECKERBOARDS -BEL02 [No adjustments needed]
test('Checkerboard Section UI Results', function (browser) {
	screenSizes.forEach(screenSize => {
		browser
			.window.setSize(screenSize.width, screenSize.height)
			.waitForElementVisible('section.checkerboard')
			.assert.screenshotIdenticalToBaseline('section.checkerboard',`checkerboard-${screenSize.name}`);
	});
}); 

//DIFFERENTIATOR SECTION -BEL02 [No adjustments needed]
	test('Differentiator Section UI Results', function (browser) {
		screenSizes.forEach(screenSize => {
			browser
				.window.setSize(screenSize.width, screenSize.height)
				.pause(1000)
				.waitForElementVisible('section.diffs')
				.assert.screenshotIdenticalToBaseline('section.diffs',`diffs-${screenSize.name}`);
		});
	}); 


//NEWS FEATURE [No adjustments needed]
	test('News Feature UI Results', function (browser) {
		screenSizes.forEach(screenSize => {
			browser
				.window.setSize(screenSize.width, screenSize.height)
				.waitForElementVisible('section.news-feature')
				.assert.screenshotIdenticalToBaseline('section.news-feature',`news-feature-${screenSize.name}`);
		});
	});


//IDENTITY SUPPORT/ STUDENT SUPPORT FEATURE
//class="section section-dark support-feature-component tab-wrapper tab-wrapper-dark curved-top"

//DEPARTMENT FEATURE
//class="section section-white organization-feature"

//WP IMAGE BLOCK
//class="wp-block-image size-full"

//WP IMAGE GALLERY
//class="wp-block-gallery has-nested-images columns-default is-cropped wp-block-gallery-1 is-layout-flex wp-block-gallery-is-layout-flex"


//WP GENERAL EMBED
//class="wp-block-embed is-type-video is-provider-youtube wp-block-embed-youtube wp-embed-aspect-16-9 wp-has-aspect-ratio"

//WP COVER BLOCK
//class="wp-block-cover"

//WP FILE BLOCK
//class="wp-block-file"

//WP MEDIA & TEXT BLOCK
//wp-block-media-text is-stacked-on-mobile

//WP SEPERATOR BLOCK
//wp-block-separator has-alpha-channel-opacity

//WP SPACER BLOCK
//class="wp-block-spacer"

//TABS (MOBILE)
//tabcordion tabcordion-pills wrap-content wp-block-bc-sitka-spruce-tabcordion


//GROUP BLOCK
//wp-block-group is-layout-constrained wp-block-group-is-layout-constrained

//SHORTCODE
//??

//CUSTOM HTML
//??

//TWITTER EMBED
//class="wp-block-embed is-type-rich is-provider-twitter wp-block-embed-twitter"

//GENERAL/YT EMBED
//wp-block-embed is-type-rich is-provider-embed-handler wp-block-embed-embed-handler
//class="wp-block-embed__wrapper"


//VIEMO EMBED
//class="wp-block-embed is-type-video is-provider-vimeo wp-block-embed-vimeo wp-embed-aspect-16-9 wp-has-aspect-ratio"



//ALERT BLOCK
//class="wp-block-mayflower-blocks-alert alert alert-success"

//MF BUTTON BLOCK
//class="wp-block-mayflower-blocks-button"

//MF BLOCK CARD
//class="wp-block-mayflower-blocks-panel card bg-default"

//MF INTRO TEXT
//class="wp-block-mayflower-blocks-lead lead"

//MF COLUMN/ROW
//class="wp-block-mayflower-blocks-column col-md-4"

//MF TABS
//class="wp-block-mayflower-blocks-tabs card"

//MF ACCORDION
//class="wp-block-mayflower-blocks-collapsibles accordion"


// CLOSING BROWSER/ END TESTS	
	after(browser => browser.end());
});

