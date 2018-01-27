var KittyCore = artifacts.require("./KittyCore.sol");
var SaleClockAuction = artifacts.require("./SaleClockAuction.sol");
var SiringClockAuction = artifacts.require("./SiringClockAuction.sol");

module.exports = function(deployer, network, accounts) {

  if (network === "live") {
    console.log('Cryptokitties is already deployed on the main chain')

  } else {

    // deploy gene science contract from bytecode

    // deployer.deploy(SaleClockAuction);
    // deployer.deploy(SiringClockAuction);

    deployer.deploy(KittyCore);

    // unpause contract

  }

};
