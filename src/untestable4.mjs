import argon2, { hash } from "@node-rs/argon2";
import pg from "pg";

// Singleton is an anti pattern
// I Will be using fakes to test.


export class PostgresUserDao {
  constructor(db){
    this.db = db;
  }

  /*
  static getInstance() {
    if (!this.instance) {
      this.instance = new PostgresUserDao();
    }
    return this.instance;
  }
  */
  close() {
    this.db.end();
  }

  #rowToUser(row) {
    return { userId: row.user_id, passwordHash: row.password_hash };
  }

  async getById(userId) {
    const { rows } = await this.db.query(
      `select user_id, password_hash
       from users
       where user_id = $1`,
      [userId]
    );
    return rows.map(this.#rowToUser)[0] || null;
  }

  async save(user) {
    await this.db.query(
      `insert into users (user_id, password_hash)
       values ($1, $2)
       on conflict (user_id) do update
           set password_hash = excluded.password_hash`,
      [user.userId, user.passwordHash]
    );
  }
}





// Fake to test the DB in memory
// This fake mimics the actual DAO, we're testing the logic without relying on the real DB
// to ensure it safely and accurately mimics the actual DAO we use StructeredClone()
export class InMemoryDAO {
  users = {}

  async getById(userId){
    return structuredClone(this.users[userId]) || null;
  }

  async save(user){
    return this.users[user.userId] = structuredClone(user);
  }
}

// You shouldnt have multiple tests for hashing related stuff
export class SecurePasswordHasher {
  hashPassword(password) {
    return argon2.hashSync(password);
  }

  verifyPassword(hash, password) {
    return argon2.verifySync(hash, password);
  }
}

export class FakePasswordHasher {
  intToHex(n) {
    return (n >>> 0).toString(16).padStart(8, "0");
  }

  hashPassword(password) {
    return this.intToHex(crc32(password));
  }

  verifyPassword(hash, password) {
    return this.hashPassword(password) === hash;
  }
}


export class PasswordService {
  users = this.db;

  async changePassword(userId, oldPassword, newPassword) {
    const user = await this.users.getById(userId);
    if (!argon2.verifySync(user.passwordHash, oldPassword)) {
      throw new Error("wrong old password");
    }
    user.passwordHash = argon2.hashSync(newPassword);
    await this.users.save(user);
  }
}
