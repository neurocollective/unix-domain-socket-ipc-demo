const {
  env: {
    GO_COMMAND: goCommand = "go run main.go",
  }
} = process;

const wait = (seconds = 1) => new Promise((resolve) => (
  setInterval(resolve, seconds * 1000)
)); 

const { exec, spawn } = require('child_process');

const main = async () => {
  // node needs to bind to the socket (creating it) before go can "dial" it
  const nodeProcess = exec("node index.js");

  nodeProcess.stdout.on('data', data => console.log(`[node server stdout] ${data}`));
  nodeProcess.stderr.on('data', data => console.log(`[node server stderr] ${data}`));

  await wait(2);

  const goProcess = exec(goCommand);

  goProcess.stdout.on('data', data => console.log(`[go server stdout] ${data}`));
  goProcess.stderr.on('data', data => console.log(`[go server stderr] ${data}`));
};

main();