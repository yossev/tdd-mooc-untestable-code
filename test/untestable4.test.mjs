import { afterEach, beforeEach, describe, test } from "vitest";
import { PasswordService, PostgresUserDao } from "../src/untestable4.mjs";
import { expect } from "chai";
import {
  FakePasswordHasher,
  InMemoryUserDao,
  PasswordService,
  PostgresUserDao,
  SecurePasswordHasher,
} from "../src/untestable4.mjs"

// Remember Contract tests, edge cases


describe("Globals and singletons: enterprise application", () => {
  const userId = 123;
  let users;
  let hasher;
  let service;
  beforeEach(() => {
    users = new InMemoryUserDao();
    hasher = new FakePasswordHasher();
    service = new PasswordService(users, hasher);
  });

  test("change password"), async  () => {
    const userBefore = {
      userId,
      passwordHash: hasher.hashPassword("old-pw")
    }
    users.save(userBefore);

    await service.changePassword(userId, "old-pw", "new-pw");

    const userAfter = users.getById(userBefore);
    expect(userAfter.passwordHash).to.not.equal(userBefore.passwordHash);
    expect(hasher.verifyPassword(userAfter.passwordHash, "new-pw")).to.be.true;
  }


  test("Old password did not match"), async () => {
     const userBefore = {
      userId,
      passwordHash: hasher.hashPassword("old-pw")
    }
    await users.save(userBefore);
    
    let error;
    try {
      await service.changePassword(userId, "wrong-pw", "new-pw");
    }
    catch(e) {
      error = e;
    }
    expect(error).to.deep.equal(new Error("wrong old password"));

    const userAfter = await users.getById(userId);
    expect(userAfter.passwordHash).to.equal(userBefore.passwordHash);
    expect(hasher.verifyPassword(userAfter.passwordHash, "old-pw")).to.be.true;
  }

  // Contract testing, testing both the fake and the real password hashers
  // during contract testing a function is created to be fed with 
  function PasswordHasherContract(hasher) {
    const hash = hasher.hashPassword("correct");

    test("correct password"), () => {
      expect(hasher.verifyPassword(hash, "correct")).to.be.true;
    }
    
    test("wrong password"), () => {
      expect(hasher.verifyPassword(hash, "wrong")).to.be.false;
    }

  }

  describe("secure password hasher", () => {
    const hasher = new SecurePasswordHasher();
    PasswordHasherContract(hasher);
  })

  describe("fake password hasher", () => {
    const hasher = new FakePasswordHasher();
    PasswordHasherContract(hasher);

    test("hash format", () => {

    expect(hasher.hashPassword("abc")).to.equal("352441c2");
    expect(hasher.intToHex(0)).to.equal("00000000");
    expect(hasher.intToHex(1)).to.equal("00000001");
    expect(hasher.intToHex(-1)).to.equal("ffffffff");
  
  });
  })


  function UserDaoContract(daoProvider) {
  let userIdSeq = 100;
  let dao;
  beforeEach(() => {
    dao = daoProvider();
  });

  test("get user by ID", async () => {
    const user1a = {
      userId: ++userIdSeq,
      passwordHash: "abc",
    };
    const user2a = {
      userId: ++userIdSeq,
      passwordHash: "xyz",
    };
    await dao.save(user1a);
    await dao.save(user2a);

    const user1b = await dao.getById(user1a.userId);
    const user2b = await dao.getById(user2a.userId);
    expect(user1b).to.deep.equal(user1a, "get user1 by ID");
    expect(user2b).to.deep.equal(user2a, "get user2 by ID");
    expect(user1b).to.not.equal(user1a, "makes defensive copies");
    expect(await dao.getById(666)).to.equal(null, "non-existing ID");
  });

  test("create and update user", async () => {
    const user = {
      userId: ++userIdSeq,
      passwordHash: "abc"
    };
    await dao.save(user);
    expect(await dao.getById(user.userId)).to.deep.equal(user, "after create");

    user.passwordHash("xyz");


    expect(await dao.getById(user.userId)).to.not.deep.equal(user, "before update");
    await dao.save(user);
    expect(await dao.getById(user.userId)).to.deep.equal(user, "after update");
  })
  }


});
