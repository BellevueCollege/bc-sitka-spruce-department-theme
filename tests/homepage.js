describe('Homepage', function () {
	//before(browser => browser.navigateTo('https://bcqabackstopjs.kinsta.cloud/sitka-default/?cache=none'));
	it('Sock UI appears correct', function (browser) {
		browser
			.navigateTo('https://bcqabackstopjs.kinsta.cloud/sitka-default/?cache=none')
			.waitForElementVisible('aside.sock.sock-standard')
			.verify.screenshotIdenticalToBaseline('aside.sock.sock-standard')
			.end();
	});
	it('Footer UI appears correct', function (browser) {
		browser
			.navigateTo('https://bcqabackstopjs.kinsta.cloud/sitka-default/?cache=none')
			.waitForElementVisible('footer.footer')
			.verify.screenshotIdenticalToBaseline('footer.footer')
			.end();
	});
	//after(browser => browser.end());
});
