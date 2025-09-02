import { describe, test } from "vitest";
import { expect } from "chai";
import { diceHandValue } from "../src/untestable2.mjs";
import { diceRoll } from "../src/untestable2.mjs";

describe("Randomness: A Dice game", () => {
  test("dice rolls are between 1 - 6", () => {
    const rolls = new Set();
    for(let i = 0; i < 100; i++){
      rolls.add(diceRoll());
    }
    expect(rolls).to.have.all.keys([1, 2, 3, 4, 5, 6]);
  });

  test("one pair", () => {
    expect(diceHandValue(1, 1)).to.equal(101);
    expect(diceHandValue(6, 6)).to.equal(106);
  })

  test("high die", () => {
    expect(diceHandValue(1, 2)).to.equal(2);
    expect(diceHandValue(4, 6)).to.equal(6);
  })
});
