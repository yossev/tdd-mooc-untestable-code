import { afterEach, beforeEach, describe, test } from "vitest";
import { PasswordService, PostgresUserDao } from "../src/untestable4.mjs";
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
});
