var Autobirther = artifacts.require("Autobirther.sol")

contract("Autobirther", function (accounts) {

  var autobirther

  it("should be payable", function () {

    return Autobirther.deployed().then(function(instance) {

      autobirther = instance

      return web3.eth.sendTransaction({ value: 100, from: accounts[0], to: autobirther.contract.address })

    }).then(function(result) {

      console.log('sent receipt:', JSON.stringify(result))

    })
  })

})
