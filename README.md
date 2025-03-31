# Test node server with curl

curl --no-buffer -X GET --unix-socket /tmp/test.sock http://localhost/unix

# Run test suite

`make dev`

In a separate shell tab, run `node test.js`. Logs & results will print to stdout.
