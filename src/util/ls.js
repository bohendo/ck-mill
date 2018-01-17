import { core } from '../eth/web3'
import db from '../db'

const addr = process.env.ETH_ADDRESS

const ls = () => {

  db.query(`select * from transfer where recipient = '${addr}';`).then(gotRes=>{
    db.query(`select * from transfer where sender = '${addr}';`).then(sentRes=>{

      //const mine = gotRes.rows.concat(bornRes.rows)
      const mine = gotRes.rows
      const sent = sentRes.rows
      
      sent.forEach(s=>{
        for (let i=0; i<mine.length; i++) {
          // if we sent a kitty after we received it..
          if (s.kittyid === mine[i].kittyid && s.blockn > mine[i].blockn) {
            // remove it from the list of our kitties
            mine.splice(i, 1)
            i -= 1 // we made our array shorter, don't increment i this iteration
          }
        }
      })

      const output = mine.map(m=>Number(m.kittyid))

      output.sort((a,b)=>b-a)

      console.log(JSON.stringify(output))
      console.log(`You have ${output.length} kitties!`)

    })
  })

  return (`fetching kitties owned by ${addr}...`)
}

export { ls }
