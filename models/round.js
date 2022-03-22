import fs from 'fs';
/**
 * scorecards is a hashmap of wordle ids
 *   with the value of
 */
class RoundModel {
  get state() {
    try {
      const state = fs.readFileSync('round.json', { encoding: 'utf-8'})
      console.count('read')
      return this.deserialize(state)
    } catch {
      return undefined
    }
  }

  setState(callback) {
    if (typeof callback !== 'function') {
      throw new Error('Expected a callback to the setState fn but received type:'+typeof callback)
    }
    const state = this.serialize(callback(this.state))
    fs.writeFileSync('round.json', state)
  }

  serialize(state) {
    return JSON.stringify(state, null, 2);
  }

  deserialize(json) {
    return JSON.parse(json)
  }
}

export default RoundModel;
