const functionsTest = require("./functions");

test("Adds 2 + 2 to equal 4", () => {
  expect(functionsTest.add(2, 2)).toBe(4);
});
