import { ethers } from "hardhat"
import { Signer } from "ethers"
import chai from "chai"
import chaiAsPromised from "chai-as-promised"
import { solidity } from "ethereum-waffle"
import { Box, Box__factory } from "../typechain"

chai.use(solidity)
chai.use(chaiAsPromised)
const { expect } = chai

// Start test block
describe('Box', () => {
  let box: Box
  let signers: any
  let boxFactory: any

  before(async () => {
    signers = (await ethers.getSigners()) as Signer[]
    boxFactory = (await ethers.getContractFactory(
      "Box",
      signers[0])
    ) as Box__factory
  })

  beforeEach(async function () {
    box = await boxFactory.deploy()
    await box.deployed()
    const valueStored = await box.retrieve()

    expect(valueStored).to.eq(0)
    expect(box.address).to.properAddress
  });

  describe("stores value", async () => {
    // Test case
    it('retrieves value previously stored', async function () {
      // Store a value
      await box.store(42);

      // Test if the returned value is the same one
      // Note that we need to use strings to compare the 256 bit integers
      expect((await box.retrieve()).toString()).to.equal('42');
    });
  })
});
