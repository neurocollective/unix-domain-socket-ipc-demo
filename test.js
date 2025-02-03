const {
	env: {
		REPETITIONS = '25'
	}
} = process;

let repetitions;
try {
	repetitions = parseInt(REPETITIONS)
} catch (err) {
	console.error(err)
	process.exit(1);
}

const headers = {
	'Content-Type': 'application/json',
};

const request = url => fetch(url, { headers }).then(r => r.json());

const unixRequest = () => request('http://localhost:8080/unix');
const localhostRequest = () => request('http://localhost:8080/');
const getSeconds = () => new Date().getTime();

const results = {
	'unix': {
		entries: [],
	},
	'localhost': {
		entries: [],
	}
};

const averagesSummer = (accumulator = 0, resultEntry) => {
	const { duration = 0 } = resultEntry;

	return accumulator + duration;
};

const report = (resultsObject) => {

	const {
		unix: {
			entries: unixEntries,
		},
		localhost: {
			entries: localhostEntries,
		},
		globalStart,
		globalEnd,
	} = resultsObject;

	const averageUnix = unixEntries.reduce(averagesSummer, 0) / unixEntries.length;
	const averageLocalhost = localhostEntries.reduce(averagesSummer, 0) / localhostEntries.length;

	resultsObject = {
		averageUnix,
		averageLocalhost,
		totalTestDuration: globalEnd - globalStart, 
	}

	const formatted = JSON.stringify(resultsObject, null, 2)
	console.log(formatted);
}

const main = async () => {
	const globalStart = getSeconds();

	console.log('starting unix repetitions...');
	for (let i = 0; i < repetitions; i++) {

		console.log(`unix ${i + 1}`);
		const start = getSeconds();

		let response;
		try {
			response = await unixRequest();
		} catch (error) {
			console.log(`error: ${error.message}`);
			continue
		}

		const end = getSeconds();
		results.unix.entries.push({ start, end, response, duration: end - start });
	}

	console.log('starting localhost repetitions...');
	for (let n = 0; n < repetitions; n++) {

		console.log(`localhost ${n + 1}`);
		const start = getSeconds();

		let response;
		try {
			response = await localhostRequest();
		} catch (error) {
			console.log(`error: ${error.message}`);
			continue
		}

		const end = getSeconds();
		results.localhost.entries.push({ start, end, response, duration: end - start });
	}

	const globalEnd = getSeconds();

	results.globalStart = globalStart;
	results.globalEnd = globalEnd;

	report(results);
};

main();
