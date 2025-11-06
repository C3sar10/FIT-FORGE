// testing the compute functions of the app

import { randomFive, randomFiveWorkouts } from "../../utils/utils";

/** Random Five Test Start */
test("randomFive returns exactly five items", () => {
  const list = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const result = randomFive({ list });
  expect(result).toHaveLength(5);
});

test("randomFive throws error when list has fewer than five items", () => {
  const list = [1, 2, 3];
  expect(() => randomFive({ list })).toThrow();
});

test("randomFive returns unique items that all exist in the original list", () => {
  const list = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const result = randomFive({ list });

  // all items come from the original list
  expect(result.every((item) => list.includes(item))).toBe(true);

  // uniqueness check
  const uniqueCount = new Set(result).size;
  expect(uniqueCount).toBe(result.length);
});
/** Random Five Test End */
