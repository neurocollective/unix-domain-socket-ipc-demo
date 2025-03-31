FROM node:20

RUN wget https://go.dev/dl/go1.24.1.linux-amd64.tar.gz
RUN tar -C /usr/local -xzf go1.24.1.linux-amd64.tar.gz
RUN export PATH=$PATH:/usr/local/go/bin

COPY dev.js .
COPY index.js .
COPY package.json .

COPY go.mod .
COPY go.sum .
COPY main.go .

RUN /usr/local/go/bin/go build -o goserver

RUN npm i

RUN rm -f /tmp/test.sock

ENV GO_COMMAND="./goserver"

CMD ["node", "dev.js"]
