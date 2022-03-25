import JSONModel from '../models/json.js';
import MessageService from './message.js'
import inline from '../utils/inline.js';
import mention from '../utils/mention.js';
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import timezone from 'dayjs/plugin/timezone.js'
import localizedFormat from 'dayjs/plugin/localizedFormat.js'
import relativeTime from 'dayjs/plugin/relativeTime.js'

/* dayjs extensions and configs */
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(localizedFormat)
dayjs.extend(relativeTime)
dayjs.tz.setDefault('America/Los_Angeles')

console.log('current:', dayjs.tz(dayjs()).format('lll'))
console.log('midnight:', dayjs.tz(dayjs()).endOf('day').format('lll'))

/**
 * @typedef {Object} ScoreState 
 * @property {string} user - hash key representing the player
 * @property {number} id - number representing the wordle id
 * @property {number} score - number representing the score for the hole
 */

/**
 * @typedef {Object} RoundState
 * @property {number} current 
 * @property {string} channel
 * @property {number} nHoles
 * @property {Array<number>} holes
 */

class RoundService {
  constructor(model = new JSONModel('round.json'), messenger = new MessageService()) {
    this._model = model;
    this._messenger = messenger;
  }
  get channel() {
    return this._model.state.channel
  }
  get isRoundStarted() {
    return this._model.state !== undefined;
  }
  get currentHole() {
    return this._model.state.current
  }
  get isHoleStarted() {
    return this._model.state.current !== -1
  }
  /**
   * recover is a method that should only be called when the application
   * initially loads. recover will check to see if the round has already
   * started and reschedule the standings post
   * @param {bolt.App} app - bolt app instance
   */
  recover(app) {
    try {
      if (this.isHoleStarted) {
        this.scheduleStandingsPost(app.client)
      }
    } catch(e) {
      console.error('Attempt to recover failed:', e)
    }
  }
  /**
   * startRound initializes the round of golf
   * @param {ScoreState} scoreState
   * @param {bolt.SayFn} say - function that allows bolt app to send messages to channel 
   * @param {string} channel - slack channel id
   */
  async startRound({ user: host }, say, channel) {
    this._model.setState(() => {
      return {
        channel,
        current: -1,
        nHoles: 3,
        holes: [],
        standings: {},
      }
    })
    await say(`${mention(host)} started a round of 3 hole Wordle golf!\n Submit your wordle results from today to play.`);
  }
  /**
   * startHole initializes the current hole and adds the current to the collection of holes
   * @param {ScoreState} scoreState 
   */
  startHole({id} /* scoreState*/) {
    this._model.setState((prev) => {
      return {
        ...prev,
        current: id,
        holes:[...prev.holes, id],
      }
    })
  }
  /**
   * resetCurrent changes the current to -1 indicating that the current hole has not started
   */
  resetCurrent() {
    this._model.setState((prev) => {
      return {
        ...prev,
        current: -1,
      }
    })
  }
  /**
   * recordScore adds or edits the standings object with the user hashmap and 
   * score for the given wordle id
   * @param {ScoreState} scoreState 
   * @param {bolt.SayFn} say
   */
  recordScore({user, id, score}, say) {
    this._model.setState((prev) => {
      const next = {
        ...prev,
        standings: {
          ...prev.standings,
          [user]: {
            ...prev.standings[user],
            [id]: score
          }
        }
      }
      const post = this._messenger.tallyPost({
        state: next,
        user,
      })
      say(post)
      return next 
    })
  }
  /**
   * tallyAll is a state reader that returns an array of 
   * player hashes, the scores over the round and the totals 
   */
  tallyAll({ holes, standings } = this._model.state) {
    return Object.entries(standings).map(([player, played]) => {
      const scores = holes.map((hole) => {
        return played[hole] || 7
      });
      return {player, scores, total: scores.reduce((a, x) => a + x) }
    })
  }
  /**
   * scheduleStandingsPost will run a process at midnight PST that gathers the scores
   * for the day AND schedules a message to be sent in the morning. scheduleStandingsPost
   * will also reset the hole at midnight and finish the round of golf.
   * @param {WebClient} client - slack webclient with a `scheduleMessage` method
   * @param {Function} schedule - function that receives both a callback and a number representing the number
   * of milliseconds the callback should wait until invoking
   */
  scheduleStandingsPost(client, schedule = setTimeout) { 
    console.log('set schedule for tallying scores')
    if (typeof schedule !== 'function') {
      throw new Error('Expected a function as the second argument to scheduleStandingsPost but received a(n)', typeof schedule)
    }
    const now = dayjs.tz(dayjs())
    const midnight = now.endOf('date');
    const morning = midnight.add(8, 'hours');
    
    schedule(() => {
      console.log('tallys and schedules message at', dayjs.tz(dayjs()).format('lll'))
      // tallys scores and tells slack client to post a message in the morning
      this.resetCurrent() // make sure that we reset the current to -1 so that the user can start at 12:01AM
      const {channel, nHoles, holes, standings} = this._model.state;

      const scorecards  = this.tallyAll({holes, standings})
      scorecards.sort(({total: a}, {total: b}) => a-b)

      const text = this._messenger.standingsPost({nHoles, holes, scorecards})
      if (nHoles === holes.length) {
        this.finish();
      }

      client.chat.scheduleMessage({
        channel,
        post_at: morning.unix(),
        text,
      })
    }, midnight.diff(now))
  }
  /**
   * finish ends the round of golf
   */
  finish() {
    this._model.remove();
  }
}

export default RoundService;