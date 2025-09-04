import { afterEach, beforeEach, describe, test } from "vitest";
import { PasswordService, PostgresUserDao } from "../src/untestable4.mjs";
import {
  FakePasswordHasher,
  InMemoryUserDao,
  PasswordService,
  PostgresUserDao,
  SecurePasswordHasher,
} from "../src/untestable4.mjs"

// Remember Contract tests, side effects and edge cases


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
});
