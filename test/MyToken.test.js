const Token = artifacts.require("MyToken");

var chai = require("chai");

const BN = web3.utils.BN;
const chaiBN = require('chai-bn')(BN);
chai.use(chaiBN);

var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

const expect = chai.expect;

contract("Token test", async (accounts) => {
  const [ initialHolder, recipient, anotherAccount ] = accounts;

  it("all tokens should be in initial holder's account", async () => {
    let instance = await Token.deployed();
    let totalSupply = await instance.totalSupply();
    let balance = await instance.balanceOf.call(initialHolder);
    assert.equal(balance.toNumber(), totalSupply.toNumber(), "Account has incorrect balance");
  });

  it("recipient holder's account should be empty", async () => {
    let instance = await Token.deployed();
    let balance = await instance.balanceOf.call(recipient);
    assert.equal(balance.toNumber(), 0, "Account has incorrect balance");
  });

  it("other account should be empty", async () => {
    let instance = await Token.deployed();
    let balance = await instance.balanceOf.call(anotherAccount);
    assert.equal(balance.toNumber(), 0, "Account has incorrect balance");
  });

  it("I can send tokens from Account 1 to Account 2", async () => {
    const sendTokens = 1;
    let instance = await Token.deployed();
    let totalSupply = await instance.totalSupply();
    let initialHolderBalance = await instance.balanceOf(initialHolder);
    expect(initialHolderBalance.toNumber()).to.equal(totalSupply.toNumber());
    expect(instance.transfer(recipient, sendTokens)).to.eventually.be.fulfilled;
    initialHolderBalance = await instance.balanceOf(initialHolder);
    expect(initialHolderBalance.toNumber()).to.equal(totalSupply.sub(new BN(sendTokens)).toNumber());
    let recipientBalance = await instance.balanceOf(recipient);
    expect(recipientBalance.toNumber()).to.equal(new BN(sendTokens).toNumber());
  });

  it("It's not possible to send more tokens than account 1 has", async () => {
    let instance = await Token.deployed();
    let balanceOfAccountBeforeTransfer = await instance.balanceOf(initialHolder);

    expect(instance.transfer(recipient, balanceOfAccountBeforeTransfer.toNumber() + 1)).to.eventually.be.rejected;

    balanceOfAccountAfterTransfer = await instance.balanceOf(initialHolder);
    //check if the balance is still the same
    expect(balanceOfAccountAfterTransfer.toNumber()).to.equal(balanceOfAccountBeforeTransfer.toNumber());
  });

})

