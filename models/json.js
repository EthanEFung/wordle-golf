import fs from 'fs';
/**
 * scorecards is a hashmap of wordle ids
 *   with the value of
 */
class JSONModel {
  constructor(fileName = 'round.json') {
    this.fileName = fileName
  }
  /**
   * state is a getter that reads the specified file and parses it as json
   * if the read fails than undefined is returned
   */
  get state() {
    try {
      const state = fs.readFileSync(this.fileName, { encoding: 'utf-8'})
      return this.deserialize(state)
    } catch {
      return undefined
    }
  }
  /**
   * setState will first get the current state and pass the state as the 
   * parameter to the callback function specified as its argument
   * @param {Function} callback - callback that expects the previous state as it's first argument
   */
  setState(callback) {
    if (typeof callback !== 'function') {
      throw new Error('Expected a callback to the setState fn but received type:'+typeof callback)
    }
    const state = this.serialize(callback(this.state))
    fs.writeFileSync(this.fileName, state)
  }
  /**
   * serialize returns a json string
   * @param {*} state 
   * @returns string
   */
  serialize(state) {
    return JSON.stringify(state, null, 2);
  }
  /**
   * deserialize parses input as json
   * @param {string} json parsable string 
   * @returns {Object} json object
   */
  deserialize(json) {
    return JSON.parse(json)
  }
  /**
   * deletes the name and possibly the file of the current model from fs
   */
  remove() {
    fs.unlinkSync(this.fileName)
  }
}

export default JSONModel;
