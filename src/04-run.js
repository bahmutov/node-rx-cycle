const Rx = require('rx');
const requests_ = new Rx.Subject();

function main() {
  return {
    HTTP: requests_.tap(e => console.log('request to', e.req.url))
  }
}

function httpEffect(model_) {
  model_.subscribe(e => {
    console.log('sending hello')
    e.res.writeHead(200, { 'Content-Type': 'text/plain' })
    e.res.end('Hello World\n')
  })
}

function run(main, effects) {
  const sinks = main()
  Object.keys(effects).forEach(key => {
    effects[key](sinks[key])
  })
}

run(main, {
  HTTP: httpEffect
})

const http = require('http')
const hostname = '127.0.0.1'
const port = 1337

http.createServer((req, res) => {
  requests_.onNext({ req: req, res: res })
}).listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`)
});
