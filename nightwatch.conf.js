// Refer to the online docs for more details:
// https://nightwatchjs.org/gettingstarted/configuration/
//
const path = require('path');
const REPORTS_PATH = path.join(__dirname, 'reports', 'e2e');
const SCREENSHOT_PATH = path.join(__dirname, 'reports', 'screenshots');
function defaultScreenshotPath(nightwatchClient, basePath, fileName) {
	return path.join(
		nightwatchClient.options.screenshotsPath ||
			basePath ||
			'reports/screenshots',
		nightwatchClient.options.desiredCapabilities.platform || 'ANY',
		nightwatchClient.options.desiredCapabilities.browserName || 'UNKNOWN',
		nightwatchClient.options.desiredCapabilities.version || 'UNKNOWN',
		nightwatchClient.currentTest.name,
		fileName.replace(/ /g, '_')
	);
}
//  _   _  _         _      _                     _          _
// | \ | |(_)       | |    | |                   | |        | |
// |  \| | _   __ _ | |__  | |_ __      __  __ _ | |_   ___ | |__
// | . ` || | / _` || '_ \ | __|\ \ /\ / / / _` || __| / __|| '_ \
// | |\  || || (_| || | | || |_  \ V  V / | (_| || |_ | (__ | | | |
// \_| \_/|_| \__, ||_| |_| \__|  \_/\_/   \__,_| \__| \___||_| |_|
//             __/ |
//            |___/

module.exports = {
	src_folders: ['tests'],
	output_folder: REPORTS_PATH,
	page_objects_path: '',
	globals_path: '',
	plugins: ['@nightwatch/vrt'],
	selenium: {
		start_process: false,
		server_path: '',
		log_path: '',
		host: 'hub.lambdatest.com',
		port: 80,
		cli_args: {
			'webdriver.chrome.driver': '',
			'webdriver.ie.driver': '',
			'webdriver.firefox.profile': '',
		},
	},
	test_workers: {
		enabled: true,
		workers: 'auto',
	},
	test_settings: {
		default: {
			silent: true,
			visual_regression_settings: {
				generate_screenshot_path: defaultScreenshotPath,
				//"latest_screenshots_path": '',
				latest_suffix: '.latest',
				//"baseline_screenshots_path": '',
				baseline_suffix: '.baseline',
				//"diff_screenshots_path": ''
				diff_suffix: '.diff',
				threshold: 0.01,
				prompt: true,
				updateScreenshots: false,
			},
			screenshots: {
				enabled: true,
				path: SCREENSHOT_PATH,
				on_failure: false,
				on_error: false,
			},
			request_timeout_options: {
				timeout: 1000000,
			},
			launch_url: 'https://lambdatest.com',
			selenium_port: 80,
			selenium_host: 'hub.lambdatest.com',
			silent: false,
			screenshots: {
				enabled: true,
				path: '',
			},
			username: '${LT_USERNAME}',
			access_key: '${LT_ACCESS_KEY}',
			skip_testcases_on_fail: false,
			desiredCapabilities: {
				'LT:Options': {
					platformName: 'Windows 10',
					project: 'Sitka',
					w3c: true,
					plugin: 'node_js-nightwatch_js',
				},
			},
		},
		chrome: {
			desiredCapabilities: {
				browserName: 'Chrome',
				browserVersion: '130',
			},
		},
		firefox: {
			desiredCapabilities: {
				browserName: 'Firefox',
				browserVersion: '132',
			},
		},
	},
};
