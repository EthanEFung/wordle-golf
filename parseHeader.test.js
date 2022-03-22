import parseHeader from './parseHeader'

test("it fails if the input does not start with with 'Wordle'", () => {
  const {valid} = parseHeader('wordle 173 1/6', 173)
  expect(valid).toBeFalsy()
})

test('it fails if the attempts are invalid', () => {
  [
    'Wordle 173 -1/6',
    'Wordle 173 0/6',
    'Wordle 173 A/6',
    'Wordle 173 1/7',
    'Wordle 173 7/6'
  ].forEach((text) => {
    const {valid} = parseHeader(text, 173)
    expect(valid).toBeFalsy()
  })
})

test("happy paths", () => {
  [
    "Wordle 173 1/6",
    "Wordle 173 2/6",
    "Wordle 173 3/6",
    "Wordle 173 4/6",
    "Wordle 173 5/6",
    "Wordle 173 6/6",
    "Wordle 173 X/6",
  ].forEach((text) => {
    const {valid} = parseHeader(text, 173)
    expect(valid).toBeTruthy()
  })
})

