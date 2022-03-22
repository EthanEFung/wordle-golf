import validBlocks from './validBlocks';

import range from 'lodash/range';

const last = ':large_green_square::large_green_square::large_green_square::large_green_square::large_green_square:'
const line = ':black_large_square::large_yellow_square::black_large_square::black_large_square::black_large_square:' 

function generateBlocks(n) {
  if (typeof n !== 'number') {
    return []
  }
  return range(1, n+1).map((x) => {
    if (x === n) {
      return last
    }
    return line
  })
}

it("fails if an array and number are not passed to the fn", function()  {
  [true, "string", 0, {}, function(){}].forEach((input) => {
    const actual = validBlocks(input, 3)
    expect(actual).toBe(false)
  })
})

it("fails if the array does not have as many lines as tries", function () {
  const tests = [
    [generateBlocks(0), 1],
    [generateBlocks(1), 2],
    [generateBlocks(3), 2],
    [generateBlocks(4), 2],
    [generateBlocks(6), 7]
  ];
  
  for(const t of tests) {
    const [blocks, tries] = t;
    expect(Array.isArray(blocks)).toBe(true)
    expect(typeof tries).toBe("number")
    const actual= validBlocks(blocks, tries)
    expect(actual).toBe(false)
  }
})

it("fails if any of the attempts comprise of any other input than squares", function () {
  const tests = ["", "lol", "7", ":emoji::emoji::emoji::emoji::emoji:"];
  for (const t of tests) {
    const blocks = generateBlocks(3).concat(t);
    expect(Array.isArray(blocks)).toBe(true);
    const actual = validBlocks(blocks, 4);
    expect(actual).toBe(false);
  }
})

it("fails if having completes less then 7 attempts the last row is not all green", function() {
  const input = generateBlocks(5).concat(line);
  const actual = validBlocks(input, 6);
  expect(actual).toBe(false);
})

it("happy paths", function() {
  const tests = [
    [generateBlocks(1), 1]
    [generateBlocks(2), 2],
    [generateBlocks(3), 3],
    [generateBlocks(4), 4],
    [generateBlocks(5), 5],
    [generateBlocks(6), 6],
    [[...generateBlocks(5),line], 7]
  ];
  for (const t of tests) {
    if (t === undefined) {
      continue
    }
    const [blocks, tries] = t;
    expect(Array.isArray(blocks)).toBe(true);
    expect(typeof tries).toBe("number");
    const actual = validBlocks(blocks, tries);
    expect(actual).toBe(true);
  }
})