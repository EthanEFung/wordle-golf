import ScoreService from './score.js';

it('can parse the meta data from a message', () => {
  const input = {
    user: 'User A',
    text: 'Wordle 100 3/6\n'
  }
  const service = new ScoreService()
  const expected = { id: 100, user: 'User A', score: 3 }
  const actual = service.tally(input)
  
  expect(actual.id).toBe(expected.id)
  expect(actual.user).toBe(expected.user)
  expect(actual.score).toBe(expected.score)
})

it('properly scores messages with unsuccessful wordle solves', () => {
  const input = {
    user: 'User B',
    text: 'Wordle 100 X/6\n'
  }
  const service = new ScoreService()
  const expected = { id: 100, user: 'User B', score: 7 }
  const actual = service.tally(input)

  expect(actual.score).toBe(expected.score)
})