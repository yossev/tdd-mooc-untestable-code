import { readFile } from "node:fs/promises";
import { parse } from "csv-parse/sync";
// When testing , decouple the file reading as much as possible from the rest
// of the code

export async function readUtf8File(path){
  const csvData = await readFile(path, { encoding: "utf8" });
  return csvData;
}

// This function is no longer async which makes it easier to test.
export function parsePeopleCsv(csvData) {
  const records = parse(csvData, {
    skip_empty_lines: true,
    trim: true,
  });
  return records.map(([firstName, lastName, age, gender]) => {
    const person = {
      firstName,
      lastName,
      gender: gender.charAt(0).toLowerCase(),
    };
    if (age !== "") {
      person.age = parseInt(age);
    }
    return person;
  });
}
