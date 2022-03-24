import inline from '../utils/inline.js';
import mention from '../utils/mention.js';

class MessageService {

  tallyPost({
    state: {nHoles, holes, standings, current},
    user,
  } = {
    user: 'user',
    state: {
      nHoles: 3,
      holes: [1, 2],
      standings: {
        "user": {
          "1": 7 
        }
      }
    },
  }) {
    const response = [
      "Genius",
      "Magnificent",
      "Impressive",
      "Splendid",
      "Great",
      "Phew",
      "Better Luck Next Time"
    ][standings[user][current]-1];
    
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
      return `${response}! ${code} brings ${mention(user)}'s final score to ${inline(total)}.\nStandings will be posted in the morning.`
    }
    if (holes.length === 1) {
      return `${response}! ${mention(user)} starts off the round with a score of ${code}. ${inline(nHoles - holes.length)} more hole(s) to play.`
    }
    return `${response}! ${code} brings ${mention(user)}'s score to ${inline(total)}. ${inline(nHoles - holes.length)} more hole(s) to play.`
  }

  standingsPost({
    nHoles,
    scorecards,
    holes,
  } = {
    nHoles: 3,
    scorecards: [
      { player: 'Unknown', scores: [7, 7, 7], total: Infinity }
    ],
    holes: [1, 2, 99],
  }) {
    let post = `Good morning! Here are the standings for the round:\n\n` 
    if (holes.length >= nHoles) {
      post = `Congrats ${mention(scorecards[0].player)} for winning this round!\n\n`
    }

    scorecards.forEach(({player, scores, total}) => {
      post += `${mention(player)}: ${inline(scores.join(' + '))} --> ${inline(total)}\n`
    })
    post += '\n'

    if (holes.length >= nHoles) {
      post += 'The round is now over. Well played everyone.'
    } else {
      post += `${nHoles - holes.length} more hole(s) are left in the round.`
    }
    return post
  }
}

export default MessageService;
