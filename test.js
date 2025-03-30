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

const testWithRepetition = (key, requestFunction, promisesList) => {

  console.log(`starting ${key} repetitions...`);

  for (let i = 0; i < repetitions; i++) {

    console.log(`${key} ${i + 1}`);
    const start = getSeconds();

    const promise = requestFunction().then((response) => {
      console.log(`request ${key} ${i} succeeded`);
      const end = getSeconds();
      results[key].entries.push({ start, end, response, duration: end - start });
    });
    promisesList.push(promise);
  } 
}

const main = async () => {
  const globalStart = getSeconds();

  const promises = [];

  testWithRepetition('unix', unixRequest, promises);

  testWithRepetition('localhost', localhostRequest, promises);

  try {
    await Promise.all(promises);
  } catch (error) {
    console.log(error);
  }

  const globalEnd = getSeconds();

  results.globalStart = globalStart;
  results.globalEnd = globalEnd;

  report(results);
};

main();
