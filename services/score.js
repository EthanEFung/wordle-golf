import parseHeader from "../parseHeader.js";

/**
 * @typedef {Object} Message
 * @property {string} user - hash representing the user
 * @property {string} text - input of the message
 * @property {string} type
 * @property {string} channel - hash key representing the channel the slack bot is monitoring
 */
/**
 * @typedef {Object} ScoreState 
 * @property {string} user - hash key representing the player
 * @property {number} id - number representing the wordle id
 * @property {number} score - number representing the score for the hole
 */
class ScoreService {
  /**
   * tally returns a scorecardState
   * @param {Message} message 
   * @param {} roundState 
   * @returns {ScoreState}
   */
  tally(message) {
    const [header] = message.text.split('\n')
    const { id, score } = parseHeader(header)
    return {
      user: message.user,
      id,
      score 
    }
  }
}

export default ScoreService;
