import ck from './ck/'

const syncAll = () => {
  return web3.eth.getBlock('latest').then(latest => {
    console.log(`Syncing sales starting with block ${latest.number}`);

    (function blockLoop(i) {
      if (i <= fromBlock) return 'done'
      saveSales(i).then(()=>{ blockLoop(i-1) }).catch(console.error)
    })(parseInt(latest.number, 10))

    // Save any new sales we detect
    ck.sale.events.AuctionSuccessful({ fromblock: latest.number }, (err, res) => {
      let q = `INSERT INTO sales VALUES (`
      q += `'${res.transactionHash}', `
      q += `${res.blockNumber}, `
      q += `${res.returnValues.tokenId}, `
      q += `${res.returnValues.totalPrice}, `
      q += `'${res.returnValues.winner}', `
      q += `to_timestamp(${Math.round(new Date().getTime()/1000)}) );`
      console.log(q)
    })

  }).catch(console.error)
}

const saveSales = (i) => {
  return ck.sale.getPastEvents('AuctionSuccessful', { fromBlock: i, toBlock: i }).then((sales) => {
    if (sales.length > 0) {
      let q = `INSERT INTO sales VALUES `
      sales.forEach((e) => {
        let sq = ' ('
        sq += `'${e.transactionHash}', `
        sq += `${e.blockNumber}, `
        sq += `${e.returnValues.tokenId}, `
        sq += `${e.returnValues.totalPrice}, `
        sq += `'${e.returnValues.winner}', `
        sq += `to_timestamp(${Math.round(new Date().getTime()/1000)}) ), `
        q += sq
      })
      q = q.slice(0,-2) + ';' // we're done, no more trailing commas needed
      console.log(q)
    }
  }).catch((err) => { console.error(err); process.exit(1) })
}

syncAll()
