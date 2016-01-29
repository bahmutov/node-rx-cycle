const Rx = require('rx');

function main(sources) {
  return {
    HTTP: sources.HTTP.tap(e => console.log('request to', e.req.url))
  }
}

function makeHttpEffect() {
  const requests_ = new Rx.Subject();
  return {
    writeEffect: function (model_) {
      model_.subscribe(e => {
        console.log('sending hello')
        e.res.writeHead(200, { 'Content-Type': 'text/plain' })
        e.res.end('Hello World\n')
      })
      return requests_
    },
    serverCallback: (req, res) => {
      requests_.onNext({ req: req, res: res })
    },
    readEffect: requests_
  }
}

const httpEffect = makeHttpEffect()
const drivers = {
  HTTP: httpEffect
}

function run(main, drivers) {
  const sources = {
    HTTP: drivers.HTTP.readEffect
  }
  const sinks = main(sources)
  Object.keys(drivers).forEach(key => {
    drivers[key].writeEffect(sinks[key])
  })
}

run(main, drivers)

const http = require('http')
const hostname = '127.0.0.1'
const port = 1337

http.createServer(httpEffect.serverCallback)
  .listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`)
  });
