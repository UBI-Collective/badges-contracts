import { ethers } from "hardhat"
import { Signer } from "ethers"
import chai from "chai"
import chaiAsPromised from "chai-as-promised"
import { solidity } from "ethereum-waffle"
import { Badge, Badge__factory } from "../typechain"

chai.use(solidity)
chai.use(chaiAsPromised)
const { expect, assert } = chai

const numClonesAllowed = 30
const numClonesRequested = 15
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

  describe("Clones a badge", async () => {
    it("Badge cloned", async () => {

      // mint badge first
      await badge.mint(contractOwner, numClonesRequested, tokenURI, { from: contractOwner })

      // expect two events:
      // 1. OriginalBadgeUpdated(originalTokenId, numClonesInWild)
      // 2. BadgeCloned(clonedTokenId, cloneFromId, tokenUri, owner)
      expect(await badge.clone(contractOwner, 1, numClonesRequested))
        .to.emit(badge, "OriginalBadgeUpdated")
          .withArgs(1, numClonesRequested)
        .to.emit(badge, "BadgeCloned")
          .withArgs(2, 1, tokenURI, contractOwner)
    })
  })

  describe("Badge has a owner", async () => {
    it("Badge is owned", async () => {
      await badge.mint(contractOwner, numClonesAllowed, tokenURI, { from: contractOwner })
      const badgeId = (await badge.getLatestBadgeId()).toNumber()
      const actualBadgeOwner = await badge.ownerOf(badgeId)

      assert.equal(actualBadgeOwner, contractOwner)
    })
  })

  describe("Transfers badge", async () => {
    it("Badge transferred", async () => {

      // mint badge first
      await badge.mint(contractOwner, numClonesAllowed, tokenURI, { from: contractOwner })

      const receiver = accounts[1]
      const badgeId = (await badge.getLatestBadgeId()).toNumber()

      // transfer badge
      await badge.transferBadge(contractOwner, receiver, badgeId)
      const newOwner = await badge.ownerOf(badgeId)

      assert.equal(newOwner, receiver)
    })
  })
});
