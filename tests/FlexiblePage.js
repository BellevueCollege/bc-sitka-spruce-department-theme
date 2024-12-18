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

//HERO AREA & SITE INTRO TESTS★ [No adjustments needed]
//class="container-xl flexible-page-intro"
test('Flexibile page Hero Area & Site Intro UI Results', function (browser) {
	//Iterates over each screen size, sets the browser window size, 
	//and performs the actions (e.g., wait, screenshot, assertion) for each size.
	screenSizes.forEach(screenSize => {
		browser
			.window.setSize(screenSize.width, screenSize.height)
			.waitForElementVisible('.flexible-page-intro')
			.assert.screenshotIdenticalToBaseline('.flexible-page-intro',`HeroIntro-${screenSize.name}`);
	});
}); 

//LEAD/INTRO TEST [Works enough for now]
test('Intro UI Results', function (browser) {
	/* Iterates over each screen size, sets the browser window size, 
	and performs the actions (e.g., wait, screenshot, assertion) for each size.*/
	screenSizes.forEach(screenSize => {
		browser
			.window.setSize(screenSize.width, screenSize.height)
			.waitForElementVisible('.wp-block-mayflower-blocks-lead')
			.assert.screenshotIdenticalToBaseline('.wp-block-mayflower-blocks-lead',`lead_intro-${screenSize.name}`);
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

//CODE BLOCK TEST [No Adjustments needed]
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

//DETAILS BLOCK [works enough for now]
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

//PREFORMATTED BLOCK TEST [BEING DUMB]
//class="wp-block-preformatted"
test('Preformatted Block UI Results', function (browser) {
	screenSizes.forEach(screenSize => {
		browser
			.window.setSize(screenSize.width, screenSize.height)
			.waitForElementVisible('.wp-block-preformatted')
			.waitForElementVisible('.wp-block-preformatted')
			.assert.screenshotIdenticalToBaseline('.wp-block-preformatted',`Preformatted-block-${screenSize.name}`);
	});
});

//TABLE TEXT [No Adjustments needed]
//class="wp-block-table"
test('Table Block UI Results', function (browser) {
	/* Iterates over each screen size, sets the browser window size, 
	and performs the actions (e.g., wait, screenshot, assertion) for each size.*/
	screenSizes.forEach(screenSize => {
		browser
			.window.setSize(screenSize.width, screenSize.height)
			.waitForElementVisible('.wp-block-table')
			.assert.screenshotIdenticalToBaseline('.wp-block-table',`Table-block-${screenSize.name}`);
	});
});
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

//APPLICATION STEPS SECTION [No Adjustments needed]
test('Application Steps Section UI Results', function (browser) {
	screenSizes.forEach(screenSize => {
		browser
			.window.setSize(screenSize.width, screenSize.height)
			.waitForElementVisible('section.application-steps-component')
			.assert.screenshotIdenticalToBaseline('section.application-steps-component',`Application-section-${screenSize.name}`);
	});
});

//TABS SECTION [No Adjustments needed]
test('Application Steps Section UI Results', function (browser) {
	screenSizes.forEach(screenSize => {
		browser
			.window.setSize(screenSize.width, screenSize.height)
			.waitForElementVisible('.section.section-dark.tabs-section-component')
			.assert.screenshotIdenticalToBaseline('.section.section-dark.tabs-section-component',`Tabs-section-${screenSize.name}`);
	});
});

//ACCORDION SECTION [No Adjustments needed]
test('Application Steps Section UI Results', function (browser) {
	screenSizes.forEach(screenSize => {
		browser
			.window.setSize(screenSize.width, screenSize.height)
			.waitForElementVisible('.section.accordion-section-content')
			.assert.screenshotIdenticalToBaseline('.section.accordion-section-content',`Accordion-section-${screenSize.name}`);
	});
});

//LISTING SECTION [No adjustments needed]
test('Listing Section UI Results', function (browser) {
	screenSizes.forEach(screenSize => {
		browser
			.window.setSize(screenSize.width, screenSize.height)
			.waitForElementVisible('section.listing-section-wrapper')
			.assert.screenshotIdenticalToBaseline('section.listing-section-wrapper',`listing-section-wrapper-${screenSize.name}`);
	});
});

//COURSE & CRED REQUIREMENTS [No adjustments needed]
test('Course & Credit Requirements UI Results', function (browser) {
	screenSizes.forEach(screenSize => {
		browser
			.window.setSize(screenSize.width, screenSize.height)
			.waitForElementVisible('section.course-information-section-wrapper')
			.assert.screenshotIdenticalToBaseline('section.course-information-section-wrapper',`Course-cred-${screenSize.name}`);
	});
});

//BODY SECTION [No Adjustments needed]
test('Body Section UI Results', function (browser) {
	screenSizes.forEach(screenSize => {
		browser
			.window.setSize(screenSize.width, screenSize.height)
			.waitForElementVisible('section.body-section-wrapper')
			.assert.screenshotIdenticalToBaseline('section.body-section-wrapper',`body-section-wrapper-${screenSize.name}`);
	});
});

//BIO SECTION [No Adjustments needed]
test('Bio Section UI Results', function (browser) {
	screenSizes.forEach(screenSize => {
		browser
			.window.setSize(screenSize.width, screenSize.height)
			.waitForElementVisible('section.bio-section-wrapper')
			.assert.screenshotIdenticalToBaseline('section.bio-section-wrapper',`bio-section-wrapper-${screenSize.name}`);
	});
});

//CONTACT SECTION [No Adjustments needed]
test('Contact Section UI Results', function (browser) {
	screenSizes.forEach(screenSize => {
		browser
			.window.setSize(screenSize.width, screenSize.height)
			.waitForElementVisible('section.section-accent-blue-extralight')
			.assert.screenshotIdenticalToBaseline('section.section-accent-blue-extralight',`contact-section-wrapper-${screenSize.name}`);
	});
});

//TESTIMONIAL SECTION [No Adjustments needed]
//class="section section-xlight testimonial-section-wrapper"
test('Testimonial Section UI Results', function (browser) {
	screenSizes.forEach(screenSize => {
		browser
			.window.setSize(screenSize.width, screenSize.height)
			.waitForElementVisible('.section.section-xlight.testimonial-section-wrapper')
			.assert.screenshotIdenticalToBaseline('.section.section-xlight.testimonial-section-wrapper',`Testimonial-section-wrapper-${screenSize.name}`);
	});
});

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

//MEDIA GALLERY [No Adjustments needed]
test('Media Gallery UI Results', function (browser) {
	/* Iterates over each screen size, sets the browser window size, 
	and performs the actions (e.g., wait, screenshot, assertion) for each size.*/
	screenSizes.forEach(screenSize => {
		browser
			.window.setSize(screenSize.width, screenSize.height)
			.waitForElementVisible('section.media-gallery-wrapper')
			.assert.screenshotIdenticalToBaseline('section.media-gallery-wrapper',`media-gallery-${screenSize.name}`);
	});
});

//PROFILE SECTION [No Adjustments needed]
test('Profiles Section UI Results', function (browser) {
	screenSizes.forEach(screenSize => {
		browser
			.window.setSize(screenSize.width, screenSize.height)
			.waitForElementVisible('section.profiles-section-wrapper')
			.assert.screenshotIdenticalToBaseline('section.profiles-section-wrapper',`profiles-section-wrapper-${screenSize.name}`);
	});
});

//DEGREE & CERT SECTION [No Adjustments needed]
test('Degree & Certification Results UI Results', function (browser) {
	/* Iterates over each screen size, sets the browser window size, 
	and performs the actions (e.g., wait, screenshot, assertion) for each size.*/
	screenSizes.forEach(screenSize => {
		browser
			.window.setSize(screenSize.width, screenSize.height)
			.waitForElementVisible('.section.degrees-certificates-section-wrapper')
			.assert.screenshotIdenticalToBaseline('.section.degrees-certificates-section-wrapper',`degree-cert-${screenSize.name}`);
	});
});

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

//IDENTITY SUPPORT/ STUDENT SUPPORT FEATURE [No adjustments needed]
test('Identity/Support Feature UI Results', function (browser) {
	screenSizes.forEach(screenSize => {
		browser
			.window.setSize(screenSize.width, screenSize.height)
			.waitForElementVisible('.support-feature-component')
			.assert.screenshotIdenticalToBaseline('.support-feature-component',`support-feature-${screenSize.name}`);
	});
});

//DEPARTMENT FEATURE [No adjustments needed]
test('Department Feature UI Results', function (browser) {
	screenSizes.forEach(screenSize => {
		browser
			.window.setSize(screenSize.width, screenSize.height)
			.waitForElementVisible('section.section.section-white.organization-feature')
			.assert.screenshotIdenticalToBaseline('section.section.section-white.organization-feature',`department-feature-${screenSize.name}`);
	});
});

//WP IMAGE BLOCK [No Adjustments needed]
test('WP Image block UI Results', function (browser) {
	screenSizes.forEach(screenSize => {
		browser
			.window.setSize(screenSize.width, screenSize.height)
			.waitForElementVisible('.wp-block-image')
			.assert.screenshotIdenticalToBaseline('.wp-block-image',`wp-image-${screenSize.name}`);
	});
});

//WP IMAGE GALLERY [No Adjustments needed]
test('WP Image Gallery UI Results', function (browser) {
	screenSizes.forEach(screenSize => {
		browser
			.window.setSize(screenSize.width, screenSize.height)
			.waitForElementVisible('.wp-block-gallery')
			.assert.screenshotIdenticalToBaseline('.wp-block-gallery',`wp-gallery-${screenSize.name}`);
	});
});

//WP YT EMBED
test('WP YT Embed UI Results', function (browser) {
	screenSizes.forEach(screenSize => {
		browser
			.window.setSize(screenSize.width, screenSize.height)
			.waitForElementVisible('.wp-block-embed')
			.assert.screenshotIdenticalToBaseline('.wp-block-embed',`wp-YT-embed-${screenSize.name}`);
	});
});

//WP COVER BLOCK
test('WP Cover UI Results', function (browser) {
	screenSizes.forEach(screenSize => {
		browser
			.window.setSize(screenSize.width, screenSize.height)
			.waitForElementVisible('.wp-block-cover')
			.assert.screenshotIdenticalToBaseline('.wp-block-cover',`wp-cover-${screenSize.name}`);
	});
});

//WP FILE BLOCK [No Adjustments needed]
test('WP File UI Results', function (browser) {
	screenSizes.forEach(screenSize => {
		browser
			.window.setSize(screenSize.width, screenSize.height)
			.waitForElementVisible('.wp-block-file')
			.assert.screenshotIdenticalToBaseline('.wp-block-file',`wp-file-${screenSize.name}`);
	});
});

//WP MEDIA & TEXT BLOCK [No Adjustments needed]
test('WP Media-Text UI Results', function (browser) {
	screenSizes.forEach(screenSize => {
		browser
			.window.setSize(screenSize.width, screenSize.height)
			.waitForElementVisible('.wp-block-media-text')
			.assert.screenshotIdenticalToBaseline('.wp-block-media-text',`wp-med-txt-${screenSize.name}`);
	});
});

//WP SEPERATOR BLOCK[WIP]
//wp-block-separator has-alpha-channel-opacity
test('WP Separator UI Results', function (browser) {
	screenSizes.forEach(screenSize => {
		browser
			.window.setSize(screenSize.width, screenSize.height)
			.waitForElementVisible('.hr.wp-block-separator')
			.assert.screenshotIdenticalToBaseline('.hr.wp-block-separator',`wp-separator-${screenSize.name}`);
	});
});

//WP SPACER BLOCK [No Adjustments needed]
test('WP Spacer UI Results', function (browser) {
	screenSizes.forEach(screenSize => {
		browser
			.window.setSize(screenSize.width, screenSize.height)
			.waitForElementVisible('.wp-block-spacer')
			.assert.screenshotIdenticalToBaseline('.wp-block-spacer',`wp-spacer-${screenSize.name}`);
	});
});

//TABS (MOBILE)/Tabcordian is used in application steps so doesn't need to be tested independately

//GROUP BLOCK
//wp-block-group is-layout-constrained wp-block-group-is-layout-constrained
test('WP GROUP UI Results', function (browser) {
	screenSizes.forEach(screenSize => {
		browser
			.window.setSize(screenSize.width, screenSize.height)
			.waitForElementVisible('.wp-block-group')
			.assert.screenshotIdenticalToBaseline('.wp-block-group',`wp-group-${screenSize.name}`);
	});
});

//SHORTCODE: literal shortcut to specificed block- no screenshot needed

//CUSTOM HTML
//??

//TWITTER/X EMBED
//class=".wp-block-embed.is-type-rich.is-provider-twitter.wp-block-embed-twitter"
test('X EMBED UI Results', function (browser) {
	screenSizes.forEach(screenSize => {
		browser
			.window.setSize(screenSize.width, screenSize.height)
			.waitForElementVisible('.wp-block-embed.is-type-rich.is-provider-twitter.wp-block-embed-twitter')
			.assert.screenshotIdenticalToBaseline('.wp-block-embed.is-type-rich.is-provider-twitter.wp-block-embed-twitter',`x-embed-${screenSize.name}`);
	});
});

//VIEMO EMBED [No Adjustments needed]
test('Vimeo embed UI Results', function (browser) {
	screenSizes.forEach(screenSize => {
		browser
			.window.setSize(screenSize.width, screenSize.height)
			.waitForElementVisible('.wp-block-embed.is-type-video.is-provider-vimeo.wp-block-embed-vimeo')
			.assert.screenshotIdenticalToBaseline('.wp-block-embed.is-type-video.is-provider-vimeo.wp-block-embed-vimeo',`vimeo-embed-${screenSize.name}`);
	});
});


//ALERT BLOCK [No Adjustments needed]
test('Alert block UI Results', function (browser) {
	screenSizes.forEach(screenSize => {
		browser
			.window.setSize(screenSize.width, screenSize.height)
			.waitForElementVisible('.wp-block-mayflower-blocks-alert')
			.assert.screenshotIdenticalToBaseline('.wp-block-mayflower-blocks-alert',`mf-alert-block-${screenSize.name}`);
	});
});

//MF BUTTON BLOCK [WIP]
test('Button block UI Results', function (browser) {
	screenSizes.forEach(screenSize => {
		browser
			.window.setSize(screenSize.width, screenSize.height)
			.waitForElementVisible('.wp-block-mayflower-blocks-button')
			.assert.screenshotIdenticalToBaseline('.wp-block-mayflower-blocks-button',`mf-block-button-${screenSize.name}`);
	});
}); 

//MF BLOCK CARD [No Adjustments needed]
test('MF panel UI Results', function (browser) {
	screenSizes.forEach(screenSize => {
		browser
			.window.setSize(screenSize.width, screenSize.height)
			.waitForElementVisible('.wp-block-mayflower-blocks-panel.card.bg-default')
			.assert.screenshotIdenticalToBaseline('.wp-block-mayflower-blocks-panel.card.bg-default',`mf-block-panel-${screenSize.name}`);
	});
}); 


//MF INTRO TEXT already tested


//MF COLUMN/ROW
//class="wp-block-mayflower-blocks-column col-md-4"
test('MF column/row UI Results', function (browser) {
	screenSizes.forEach(screenSize => {
		browser
			.window.setSize(screenSize.width, screenSize.height)
			.waitForElementVisible('.wp-block-mayflower-blocks-column.col-md-4')
			.assert.screenshotIdenticalToBaseline('.wp-block-mayflower-blocks-column.col-md-4',`mf-column-${screenSize.name}`);
	});
}); 



//MF TABS {No Adjustments needed}
test('MF tabs UI Results', function (browser) {
	screenSizes.forEach(screenSize => {
		browser
			.window.setSize(screenSize.width, screenSize.height)
			.waitForElementVisible('.wp-block-mayflower-blocks-tabs.card')
			.assert.screenshotIdenticalToBaseline('.wp-block-mayflower-blocks-tabs.card',`mf-tabs-${screenSize.name}`);
	});
}); 


//MF ACCORDION {No Adjustments needed}
test('MF Accordion UI Results', function (browser) {
	screenSizes.forEach(screenSize => {
		browser
			.window.setSize(screenSize.width, screenSize.height)
			.waitForElementVisible('.wp-block-mayflower-blocks-collapsibles.accordion')
			.assert.screenshotIdenticalToBaseline('..wp-block-mayflower-blocks-collapsibles.accordion',`mf-accordion-${screenSize.name}`);
	});
}); 



// CLOSING BROWSER/ END TESTS	
	after(browser => browser.end());
});