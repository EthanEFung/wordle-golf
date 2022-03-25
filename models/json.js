import fs from 'fs';
/**
 * scorecards is a hashmap of wordle ids
 *   with the value of
 */
class JSONModel {
  constructor(fileName = 'round.json') {
    this.fileName = fileName
  }
  get state() {
    try {
      const state = fs.readFileSync(this.fileName, { encoding: 'utf-8'})
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
    fs.writeFileSync(this.fileName, state)
  }

  serialize(state) {
    return JSON.stringify(state, null, 2);
  }

  deserialize(json) {
    return JSON.parse(json)
  }
  remove() {
    fs.unlinkSync(this.fileName)
  }
}

export default JSONModel;
