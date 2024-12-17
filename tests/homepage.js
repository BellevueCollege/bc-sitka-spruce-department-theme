describe('Homepage', function () {

	before(browser => browser.navigateTo('https://bcqabackstopjs.kinsta.cloud/sitka-default/?cache=none'));

	it('Page Footer UI appears correct', function (browser) {
		browser
			.waitForElementVisible('footer.footer')
			.assert.screenshotIdenticalToBaseline('footer.footer')
	});


	it('Page Header UI appears correct', function (browser) {
		browser
			.waitForElementVisible('header#header-wrapper')
			.assert.screenshotIdenticalToBaseline('header#header-wrapper', 'homepage-header-neutral-state')
	});

	it('Page Header UI appears correct with menu expanded', function (browser) {
		browser
			.waitForElementVisible('header#header-wrapper')
			.moveToElement('#site-header--menu-wrapper .menu > li:nth-child(1) > a', 10, 10)
			.assert.screenshotIdenticalToBaseline('header#header-wrapper', 'homepage-header-menu-expanded-state')
	});

	it('Page Sock UI appears correct', function (browser) {
		browser
			.waitForElementVisible('aside.sock.sock-standard')
			.assert.screenshotIdenticalToBaseline('aside.sock.sock-standard')
	});

	after(browser => browser.end());
});
