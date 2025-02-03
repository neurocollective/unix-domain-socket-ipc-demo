const { exec, spawn } = require('child_process');

const goProcess = exec("go run main.go"); // { detached: true });
const nodeProcess = exec("node index.js"); //, { detached: true });

goProcess.stdout.on('data', data => console.log(`[go server stdout] ${data}`));
goProcess.stderr.on('data', data => console.log(`[go server stderr] ${data}`));

nodeProcess.stdout.on('data', data => console.log(`[node server stdout] ${data}`));
nodeProcess.stderr.on('data', data => console.log(`[node server stderr] ${data}`));
