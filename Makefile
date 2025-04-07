dev:
	@rm -f /tmp/test.sock
	@node dev.js
docker/build:
	docker build -t go-n-node .
docker/run:
	docker run -p 3000:3000 go-n-node