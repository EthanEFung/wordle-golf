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
   * start begins the round
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

  startHole({id} /* scoreState*/) {
    this._model.setState((prev) => {
      return {
        ...prev,
        current: id,
        holes:[...prev.holes, id],
      }
    })
  }
  resetCurrent() {
    this._model.setState((prev) => {
      return {
        ...prev,
        current: -1,
      }
    })
  }
  /**
   * scheduleScore should ask to the model to
   * save the score of the given user
   * @param {ScoreState} scoreState 
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
   * tallyAll is a state reader returns an array of 
   * player hashes, the scores over the round a the totals 
   */
  tallyAll({ holes, standings } = this._model.state) {
    return Object.entries(standings).map(([player, played]) => {
      const scores = holes.map((hole) => {
        return played[hole] || 7
      });
      return {player, scores, total: scores.reduce((a, x) => a + x) }
    })
  }
  
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

      client.chat.scheduleMessage({
        channel,
        post_at: morning.unix(),
        text,
      })
    }, midnight.diff(now))
  }


  archiveRound() {
    this._model.move('')
  }
}

export default RoundService;