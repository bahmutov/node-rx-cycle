const Rx = require('rx')
const debug = require('debug')('rate')

function rateLimit(stream_, delayMs) {
  const out_ = new Rx.Subject()
  var nextTimestamp = +(new Date())
  var hasEvents = 0;
  const started = nextTimestamp

  function onEvent(e) {
    var now = +(new Date())
    debug('now', now - started, 'next', nextTimestamp - started)

    if (now > nextTimestamp) {
      nextTimestamp = now + delayMs
      debug('now %d set next timestamp at',
        now - started, nextTimestamp - started)
      out_.onNext(e)
      return
    }

    // delay the response
    const sleepMs = nextTimestamp - now;
    debug('need to sleep for %d ms at', sleepMs, now - started)
    nextTimestamp += delayMs
    hasEvents += 1

    setTimeout(function () {
      debug('sending', e, 'at', +(new Date()) - started)
      out_.onNext(e)
      hasEvents -= 1
      if (!hasEvents) {
        out_.onCompleted()
      }
    }, sleepMs)
  }

  stream_.subscribe(
    onEvent,
    out_.onError.bind(out_)
  )

  return out_
}

module.exports = rateLimit

if (!module.parent) {
  const in_ = Rx.Observable
    .interval(200)
    .take(5)
  // without rate limit
  // in_
  //   .timeInterval()
  //   .subscribe(
  //     console.log.bind(console),
  //     console.error.bind(console),
  //     console.log.bind(console, 'completed')
  //   )
  // output
  // { value: 0, interval: 203 }
  // { value: 1, interval: 232 }
  // { value: 2, interval: 207 }
  // { value: 3, interval: 206 }
  // { value: 4, interval: 202 }
  // completed

  // with rate limit
  const limited_ = rateLimit(in_, 1000)
  limited_
    .timeInterval()
    .subscribe(
      console.log,
      console.error,
      console.log.bind(console, 'limited completed')
    )
  // output
  // { value: 0, interval: 203 }
  // { value: 1, interval: 1005 }
  // { value: 2, interval: 1001 }
  // { value: 3, interval: 996 }
  // { value: 4, interval: 999 }
  // limited completed
}
