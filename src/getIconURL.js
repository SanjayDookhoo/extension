import puppeteer from 'puppeteer';

const memoizedFileExtensions = {};
const dayInMilliseconds = 86400000;
//const dayInMilliseconds = 30000; // testing using 30 seconds

const getIconURL = async (req, res) => {
	const { extension } = req.query;

	if (memoizedFileExtensions[extension]) {
		const { json, lastRetrieved } = memoizedFileExtensions[extension];

		// refresh asynchronously for the next time, immediately return the current value to the requester
		if (lastRetrieved + dayInMilliseconds < Date.now()) {
			refreshMemo(extension);
		}

		res.status(200).json(json);

		return;
	}
	puppeteer
		.launch({
			headless: true,
		})
		.then(async (browser) => {
			const page = await browser.newPage();

			let url = `https://fileinfo.com/extension/${extension}`;
			await page.goto(url, {
				waitUntil: 'domcontentloaded',
				timeout: 0,
			});

			const extIcons = await page.$$eval('.entryIcon', (imgs) => {
				return imgs.map((img) => ({
					normal: img.getAttribute('data-bg'),
					large: img.getAttribute('data-bg-lg'),
				}));
			});

			if (extIcons.length == 0) {
				const json = { message: 'File extension could not be found' };
				memoizedFileExtensions[extension] = {
					json,
					lastRetrieved: Date.now(),
				};
				res.status(400).json(json);
			} else {
				const json = extIcons[0];
				memoizedFileExtensions[extension] = {
					json,
					lastRetrieved: Date.now(),
				};
				res.status(200).json(json);
			}
		});
};

export default getIconURL;

// refreshes in case urls change
const refreshMemo = async (extension) => {
	// update teh lastRetrieved here, so it doesnt wait for the browser page to load entirely, and allow multiple refreshMemo calls unnecessarily
	memoizedFileExtensions[extension] = {
		...memoizedFileExtensions[extension], // spreads to not lose the json property, until the new json property is retrieved
		lastRetrieved: Date.now(),
	};

	// console.log('refreshingggggggggggggggggggg');
	puppeteer
		.launch({
			headless: true,
		})
		.then(async (browser) => {
			const page = await browser.newPage();

			let url = `https://fileinfo.com/extension/${extension}`;
			await page.goto(url, {
				waitUntil: 'domcontentloaded',
				timeout: 0,
			});

			const extIcons = await page.$$eval('.entryIcon', (imgs) => {
				return imgs.map((img) => ({
					normal: img.getAttribute('data-bg'),
					large: img.getAttribute('data-bg-lg'),
				}));
			});

			if (extIcons.length == 0) {
				const json = { message: 'File extension could not be found' };
				memoizedFileExtensions[extension] = {
					json,
					lastRetrieved: Date.now(),
				};
				// res.status(400).json(json);
			} else {
				const json = extIcons[0];
				memoizedFileExtensions[extension] = {
					json,
					lastRetrieved: Date.now(),
				};
				//res.status(200).json(json);
			}
		});
};
