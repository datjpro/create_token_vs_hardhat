const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Floppy Token", function () {
  let Floppy, floppy, owner, addr1, addr2;
  const CAP = ethers.parseUnits("50000000000", 18); // 50_000_000_000 * 10^18

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    Floppy = await ethers.getContractFactory("Floppy");
    floppy = await Floppy.deploy();
    await floppy.waitForDeployment();
  });

  it("Should assign the cap supply to owner at deployment", async function () {
    expect(await floppy.totalSupply()).to.equal(CAP);
    expect(await floppy.balanceOf(owner.address)).to.equal(CAP);
  });

  it("Owner can mint, cannot exceed cap", async function () {
    const mintAmount = ethers.parseUnits("1000", 18);
    await expect(floppy.mint(addr1.address, mintAmount)).to.not.be.reverted;
    expect(await floppy.balanceOf(addr1.address)).to.equal(mintAmount);

    // Mint over cap should revert
    await expect(
      floppy.mint(addr1.address, ethers.parseUnits("1", 18))
    ).to.be.revertedWith("Floppy: cap exceeded");
  });

  it("Non-owner cannot mint", async function () {
    await expect(
      floppy.connect(addr1).mint(addr2.address, ethers.parseUnits("1000", 18))
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Anyone can burn their own tokens", async function () {
    const burnAmount = ethers.parseUnits("1000", 18);
    await floppy.transfer(addr1.address, burnAmount);
    await floppy.connect(addr1).burn(burnAmount);
    expect(await floppy.balanceOf(addr1.address)).to.equal(0);
  });

  it("Token metadata is correct", async function () {
    expect(await floppy.name()).to.equal("Floppy");
    expect(await floppy.symbol()).to.equal("FLP");
    expect(await floppy.decimals()).to.equal(18);
  });
});
