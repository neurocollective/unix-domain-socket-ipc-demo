dev:
	@rm -f /tmp/test.sock
	@node dev.js
docker/build:
	docker build -t go-n-node .
docker/run:
	docker run -p 8080:8080 go-n-node