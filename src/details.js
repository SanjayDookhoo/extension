import { browser } from '.';

const memoizedFileExtensions = {};
const secondsBeforeRefresh = 2592000; // default is seconds for 30 days, this is the default max age given from fileinfo on one of the file extension images
// const secondsBeforeRefresh = 30; // testing

const details = async (req, res) => {
	// console.log('details requested');
	const { extension } = req.query;

	if (memoizedFileExtensions[extension]) {
		const { json, lastRetrieved } = memoizedFileExtensions[extension];

		// refresh asynchronously for the next time, immediately return the current value to the requester
		if (lastRetrieved + secondsBeforeRefresh * 1000 < Date.now()) {
			pageLaunch({ extension });
		}

		res.status(200).json(json);

		return;
	}

	pageLaunch({ extension, res });
};

export default details;

const pageLaunch = async ({ extension, res }) => {
	if (!browser) {
		const json = { message: 'Error, please try again' };
		if (res) {
			res.status(400).json(json);
		}

		return;
	}

	const page = await browser.newPage();

	let url = `https://fileinfo.com/extension/${extension}`;
	await page.goto(url, {
		waitUntil: 'domcontentloaded',
		timeout: 0,
	});

	const extIconArr = await page.$$eval('.entryIcon', (imgs) => {
		return imgs.map((img) => ({
			normal: img.getAttribute('data-bg'),
			large: img.getAttribute('data-bg-lg'),
		}));
	});
	const extFullNameArr = await page.$$eval('.title', (titles) => {
		return titles.map((title) => title.innerHTML);
	});

	if (extIconArr.length == 0 || extFullNameArr.length == 0) {
		const json = { message: 'File extension could not be found' };
		if (res) {
			res.status(400).json(json);
		}
	} else {
		const json = {
			icons: extIconArr[0],
			fullName: extFullNameArr[0],
		};
		memoizedFileExtensions[extension] = {
			json,
			lastRetrieved: Date.now(),
		};
		// console.log('test');
		if (res) {
			res
				.status(200)
				.set({
					'cache-control': `max-age=${secondsBeforeRefresh}`, // browser caches the response
				})
				.json(json);
		}
	}
	page.close();
};
