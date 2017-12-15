import * as ck from './index'

// When this function returns, it will be executed again after a short delay
const heartbeat = (n) => {
  ck.core.totalSupply((err, max) => {
    console.log(`There are ${max} cryptokitties in the world`)
    var now = new Date().getTime()/1000
    const kittyLoop = (i) => {
      // Print something helpful
      if (i > 0 && i % 10 === 0) {
        let then = now
        now = new Date().getTime()/1000
        console.log(`Got kitties ${i-10}-${i} in ${now-then} seconds`)
      }
      // Stop once we get to the last kitty
      if (i > max) { return 'Done' } // replace artificial cap w max

      let kitty = getKitty(i)
      // save kitty in database..?

      kittyLoop(i+1)
    }
    kittyLoop(0)
    console.log('loop skipped')
  })
}

// Ensure this geth node never exits,
// it should sync repeatedly instead
(function stayalive(n, interval, fn) {
  let now = new Date().getTime()/1000

  heartbeat(n)

  let then = now
  now = new Date().getTime()/1000
  console.log(`heartbeat ${n} finished in ${now-then} seconds`)
  admin.sleep(interval)
  stayalive(n+1, interval, fn)
}(1, 10, heartbeat))

