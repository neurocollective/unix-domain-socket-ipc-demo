const express = require('express');
const { exec } = require('child_process');
const http = require('http');

const app = express();

const {
  env: {
    SOCKET_PATH = '/tmp/test.sock',
    PORT = '3000',
    OTHER_PORT = '8080',
  }
} = process;

const headers = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
};

const socketOptions = {
  socketPath: SOCKET_PATH,
  headers,
  method: 'POST',
};


const makeRequest = (url, body = {}, options) => new Promise((resolve, reject) => {
  const callback = (res) => {
    console.log(`response status code: ${res.statusCode}`);
    res.setEncoding('utf8');
    let responseData = '';
    let errorData = '';
    res.on('data', (data) => {
      responseData += data.toString();
    });
    res.on('error', (data) => {
      errorData += data.toString();
    });
    res.on('end', () => {
      if (errorData) {
        let errorJson;
        try{
          errorJson = JSON.parse(errorData);
        } catch (error) {
        return reject({ error: errorData });   
        }
        return reject({ error: errorJson });
      }
      let json;
      try {
        json = JSON.parse(responseData);
      } catch (error) {
        return res.json({ data: responseData })
      } 
      return resolve(json);
    });
  };

  let clientRequest;
  if (!url) {
    clientRequest = http.request(options, callback);
  } else {
    clientRequest = http.request(url, options, callback);
  } 

  if (typeof body === 'string') {
    clientRequest.write(body);
  }
  clientRequest.end();
});

app.use(express.json());

app.post('/unix', async (req, res) => {
  console.log('incoming body:', req.body);
  const stringBody = JSON.stringify(req.body);
  const responseBody = await makeRequest('', stringBody, socketOptions);

  if (responseBody.error) {
    return res.status(500).json(responseBody);
  }
  return res.json(responseBody);
});

app.post('/', async (req, res) => {
  console.log('incoming body:', req.body);
  const options = { headers, method: 'POST' };
  const stringBody = JSON.stringify(req.body);
  const responseBody = await makeRequest(`http://localhost:${OTHER_PORT}`, stringBody, options);

  if (responseBody.error) {
    return res.status(500).json(responseBody);
  }
  return res.json(responseBody);
});

app.listen(PORT, () => console.log(`node server listening on ${PORT}`));
