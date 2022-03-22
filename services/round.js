import RoundModel from '../models/round.js';
import inline from '../utils/inline.js';
import mention from '../utils/mention.js';
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import timezone from 'dayjs/plugin/timezone.js'
import localizedFormat from 'dayjs/plugin/localizedFormat.js'
import relativeTime from 'dayjs/plugin/relativeTime.js'
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(localizedFormat)
dayjs.extend(relativeTime)
dayjs.tz.setDefault('America/Los_Angeles')

console.log('local time', dayjs.tz(dayjs()).format('lll'))
console.log('midnight', dayjs.tz(dayjs()).endOf('day').format('lll'))

/**
 * @typedef {Object} ScoreState 
 * @property {string} user - hash key representing the player
 * @property {number} id - number representing the wordle id
 * @property {number} score - number representing the score for the hole
 */

class RoundService {
  _model = new RoundModel()
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

  startHole({id} /* scoreState*/, client) {
    this._model.setState((prev) => {
      return {
        ...prev,
        current: id,
        holes:[...prev.holes, id],
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
      const response = [
        "Genius",
        "Magnificent",
        "Impressive",
        "Splendid",
        "Great",
        "Phew",
        "Better Luck Next Time"
      ][score-1];

      const scores = this.tally(next, user)
      say(response + "! " + scores)
      return next 
    })
  }
  tally({nHoles, holes, standings}, user) {
    let total = 0
    const scores = []
    const scorecard = standings[user]
    for (const hole of holes) {
      const score = scorecard[hole] || 7
      total += score 
      scores.push(score)
    }
    const code = inline(scores.join(' + '))
    if (nHoles === holes.length) {
      return `${code} brings ${mention(user)}'s final score to ${inline(total)}.\nStandings will be posted in the morning.`
    }
    if (holes.length === 1) {
      return `${mention(user)} tees off the round with a score of ${code}. ${inline(nHoles - holes.length)} more hole(s) to play.`
    }
    return `${code} brings ${mention(user)}'s score to ${inline(total)}. ${inline(nHoles - holes.length)} more hole(s) to play.`
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
  
  scheduleStandingsPost(client, setTimeout = setTimeout) { 
    console.log('set schedule for tallying scores')
    const now = dayjs.tz(dayjs())
    const midnight = now.endOf('date');
    const morning = midnight.add(8, 'hours');
    
    setTimeout(() => {
      const {channel, nHoles, holes, standings} = this._model.state;
      console.log('scheduled message at', dayjs.tz(dayjs()).format('lll'))
      const scorecards  = this.tallyAll({holes, standings})
      scorecards.sort(({total: totalA}, {total: totalB}) => {
        return totalA-totalB
      })

      let post = `Good morning! Here are the standings for the round:\n\n` 
      if (holes.length >= nHoles) {
        post = `Congrats ${mention(scorecards[0].player)} for winning this round!\n\n`
      }

      scorecards.forEach(({player, scores, total}, i) => {
        post += `${mention(player)}: ${inline(scores.join(' + '))} --> ${inline(total)}\n`
      })
      post += '\n'

      if (holes.length >= nHoles) {
        post += 'The round is now over. Well played everyone.'
      } else {
        post += `${nHoles - holes.length} more hole(s) are left in the round.`
      }

      client.chat.scheduleMessage({
        channel,
        post_at: morning.unix(),
        // post_at: dayjs.tz(dayjs()).add(10, 'seconds').unix(),
        text: post,
      })
    }, midnight.diff(now))
  }
}

export default RoundService;