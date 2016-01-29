const Rx = require('rx');
const requests_ = new Rx.Subject();
const started = +(new Date())

function sendHello(e) {
  console.log('sending hello at', +(new Date()) - started);
  e.res.writeHead(200, { 'Content-Type': 'text/plain' });
  e.res.end('Hello World\n');
}

const interval = 1000
const rateLimit = require('./rate-limit')

requests_
  .tap(e => console.log(`request to ${e.req.url} at`, +(new Date) - started))
  .subscribe(sendHello)

// server
const http = require('http');
const hostname = '127.0.0.1';
const port = 1337;

var prevMs = +(new Date())

http.createServer((req, res) => {
  requests_.onNext({ req: req, res: res });
}).listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

