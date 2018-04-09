
var Test_artifacts = artifacts.require("./High_low.sol");

module.exports = function(deployer) {

  deployer.deploy(Test_artifacts,{gas:4612388, from:web3.eth.accounts[0]});
};
