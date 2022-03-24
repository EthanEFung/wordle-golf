import { isArrayLikeObject } from 'lodash';
import RoundService from './round.js';

class MockModel {
  get state() {
    return this._state
  }
  setState(callback) {
    this._state = callback(this._state)
  }
  serialize(state) {
    return JSON.stringify(state);
  }
  deserialize(json) {
    return JSON.parse(json);
  }
}

it('can start a round of golf', () => {
  const service = new RoundService(new MockModel())
  service.startRound({ user: 'host'}, () => {}, 'TEST CHANNEL')
  const expected = {
    channel: 'TEST CHANNEL',
    current: -1,
    nHoles: 3,
    holes: [],
    standings: {}
  }
  const actual = service._model.state
  expect(actual.channel).toBe(expected.channel)
  expect(actual.current).toBe(expected.current)
  expect(actual.nHoles).toBe(expected.nHoles)
  expect(actual.holes.length).toBe(expected.holes.length)
})
it('can start a hole of golf', () => {
  const service = new RoundService(new MockModel())
  service.startRound({user: 'host'}, () => {}, 'TEST CHANNEL')
  service.startHole({ id: 100 })
  const expected = {
    current: 100,
    holes: [100]
  }
  const actual = service._model.state
  expect(actual.current).toBe(expected.current)
  expect(actual.holes.length).toBe(expected.holes.length)
  expect(actual.holes[0]).toBe(expected.holes[0])
})
it('record the score of a player', () => {
  const service = new RoundService(new MockModel())
  service.startRound({user: 'host'}, () => {}, 'TEST CHANNEL')
  service.startHole({ id: 100 })
  service.recordScore({ user: 'TEST USER', id: 100, score: 3 }, () => {})
  const expected = {
    standings: {
      "TEST USER": { "100": 3 }
    }
  }
  const actual = service._model.state
  expect(actual.standings["TEST USER"]["100"]).toBe(expected.standings["TEST USER"]['100'])
})
it('tallys all player scores', () => {
  const service = new RoundService(new Object())
  const [standingA, standingB] = service.tallyAll({
    holes: [100, 101],
    standings: {
      userA: { 100: 3, 101: 4 },
      userB: { 100: 5, 101: 6 }
    }
  })
  expect(standingA.player).toBe('userA')
  expect(standingB.player).toBe('userB')
  expect(standingA.total).toBe(7)
  expect(standingB.total).toBe(11)
})

it('has means to reset the current hole that is being played', () => {
  const service = new RoundService(new MockModel())
  service.startRound({user: 'host'}, console.log, 'TEST CHANNEL')
  service.startHole({ id: 100 })
  service.recordScore({ user: 'TEST USER', id: 100, score: 3 }, console.log)
  let expected = {
    current: 100,
    standings: {
      "TEST USER": { "100": 3 }
    }
  }
  let actual = service._model.state
  expect(actual.current).toBe(expected.current)
  expect(actual.standings["TEST USER"]["100"]).toBe(expected.standings["TEST USER"]['100'])

  service.resetCurrent()
  expected = {
    current: -1,
    standings: {
      "TEST USER": { "100": 3 }
    }
  }
  actual = service._model.state
  expect(actual.current).toBe(-1)
  expect(actual.current).toBe(expected.current)
  expect(actual.standings["TEST USER"]["100"]).toBe(expected.standings["TEST USER"]['100'])
  
  service.startHole({ id: 101 })
  service.recordScore({ user: 'TEST USER', id: 101, score: 4 }, console.log)
  expected = {
    current: 101,
    standings: {
      "TEST USER": { "100": 3, "101": 4 }
    }
  }
  actual = service._model.state
  expect(actual.current).toBe(101)
  expect(actual.current).toBe(expected.current)
  expect(actual.standings["TEST USER"]["100"]).toBe(expected.standings["TEST USER"]['100'])
  expect(actual.standings["TEST USER"]["101"]).toBe(expected.standings["TEST USER"]['101'])
})
it.todo('can schedule a time to tally the scores')