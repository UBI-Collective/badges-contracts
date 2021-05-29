import { ethers } from "hardhat"
import { Signer } from "ethers"
import chai from "chai"
import chaiAsPromised from "chai-as-promised"
import { solidity } from "ethereum-waffle"
import { Badge, Badge__factory } from "../typechain"

chai.use(solidity)
chai.use(chaiAsPromised)
const { expect, assert } = chai

const numClonesAllowed = 100
const numClonesRequested = 50
const tokenURI = "http://sticlalux.ro/bedge.json"


// Start test block
describe("Badge contract", () => {
  let badge: Badge
  let signers: any
  let badgeFactory: any
  let accounts: any
  let contractOwner: string

  before(async () => {
    signers = (await ethers.getSigners()) as Signer[]
    accounts = await ethers.provider.listAccounts()
    contractOwner = accounts[0]

    badgeFactory = (await ethers.getContractFactory(
      "Badge",
      signers[0])
    ) as Badge__factory
  })

  beforeEach(async function () {
    badge = await badgeFactory.deploy()
    await badge.deployed()

    expect(badge.address).to.properAddress
  });

  describe("Deploys", async () => {
    it("Badge contract deployed", async () => {
      assert.notEqual(badge.address, "0x0")
      assert.notEqual(badge.address, "")
      assert.notEqual(badge.address, null)
      assert.notEqual(badge.address, undefined)
    })
  })

  describe("Mints a badge", async () => {
    it("Badge minted", async () => {

      // expect Minted(tokenId, numClonesAllowed, numClonesInWild, tokenURI, owner) event
      expect(await badge.mint(contractOwner, numClonesAllowed, tokenURI, { from: contractOwner }))
        .to.emit(badge, "BadgeMinted")
        .withArgs(1, numClonesAllowed, 0, tokenURI, contractOwner)
    })
  })

  describe("Sets token URI", async () => {
    it("Token URI set", async () => {
      await badge.mint(contractOwner, numClonesAllowed, tokenURI, { from: contractOwner })
      const badgeId = (await badge.getLatestBadgeId()).toNumber()
      const badgeUri = await badge.tokenURI(badgeId)

      assert.equal(tokenURI, badgeUri) 
    })
  })
});
