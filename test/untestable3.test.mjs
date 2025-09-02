import { describe, test } from "vitest";
import { expect } from "chai";
import { parsePeopleCsv } from "../src/untestable3.mjs";
import { readUtf8File } from "../src/untestable3.mjs";

// example input:
// Loid,Forger,,Male
// Anya,Forger,6,Female
// Yor,Forger,27,Female


describe("File System: CSV file parsing", () => {
  // Decoupled and tested the File reading
  test("Read file", async () => {
      expect(await readUtf8File("./test/dummy.txt")).to.equal("dummy file\n");
  });

  test("parse CSV", () => {
    const input = `
      Loid,Forger,,Male
      Anya,Forger,6,Female
      Yor,Forger,27,Female`;
      expect(parsePeopleCsv(input)).to.deep.equal([
      { firstName: "Loid", lastName: "Forger", gender: "m" },
      { firstName: "Anya", lastName: "Forger", age: 6, gender: "f" },
      { firstName: "Yor", lastName: "Forger", age: 27, gender: "f" },
    ]);
  })

  // Decouple test responsibilites more atomically

  describe("CSV parsing, more atomically", () => {
    test("parses name", () =>{
      const person = parsePeopleCsv("Anya,Forger,6,Female")[0];
      expect(person.firstName).to.equal("Anya");
      expect(person.lastName).to.equal("Forger");
    })

    test("parses age", () => {
      expect(parsePeopleCsv("x,x,6,Female")[0].age).to.equal(6);
      expect(parsePeopleCsv("x,x,,Female")[0].age, "age is optional").to.equal(undefined);
    })
    test("parses gender", () => {
      expect(parsePeopleCsv("x,x,1,Male")[0].gender).to.equal("m");
      expect(parsePeopleCsv("x,x,1,Female")[0].gender).to.equal("f");
      expect(parsePeopleCsv("x,x,1,female")[0].gender, "gender is case-insensitive").to.equal("f");
    });

    test("skips empty lines", () => {
      const input = `
      A,A,1,Male

      B,B,1,Male
      `;
      expect(parsePeopleCsv(input)).to.deep.equal([
        { firstName: "A", lastName: "A", age: 1, gender: "m" },
        { firstName: "B", lastName: "B", age: 1, gender: "m" },
      ]);
    });

    test("trims whitespace around values", () => {
      const input = "  A  ,  B  ,  1  ,  Male  ";
      expect(parsePeopleCsv(input)).to.deep.equal([{ firstName: "A", lastName: "B", age: 1, gender: "m" }]);
  });

});

});