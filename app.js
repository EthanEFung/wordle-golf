import bolt from '@slack/bolt';
import parseHeader from './parseHeader.js';
import validBlocks from './validBlocks.js';
import RoundService from './services/round.js';
import ScorecardService from './services/score.js'
import dotenv from 'dotenv';
dotenv.config()

const { App } = bolt

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

function validateWordleSubmission(text /* string */) /* boolean */ {
  // validate to make sure that what is submitted is an input logic can be run on
  const [header, , ...blocks] = text.split('\n')
  /**
   * within the valid header we should check what the current
   * days id is, and return valid if and only if the text id
   * matches.
   */
  // validate if the header begins with Wordle
  const { valid: validHeader, score } = parseHeader(header)
  if (validHeader === false) {
    console.log('invalid header')
    return false
  }
  if (validBlocks(blocks, score) === false) {
    console.log('invalid blocks')
    return false
  }
  console.log('valid')
  return true
}

(async () => {
  const roundService = new RoundService();
  await app.start(process.env.PORT || 3000);
  console.log('bolt app is running')
  roundService.recover(app)
  app.message(async function parseWordle({message, say, client, token})  {
    if (validateWordleSubmission(message.text) === false) {
      return
    }
    /*
      We've determined that the input is valid and the header parseable
    */
    const scorecardCtrl = new ScorecardService()
    const scorecardState = scorecardCtrl.tally(message)

    if (roundService.isRoundStarted === false) {
      await roundService.startRound(scorecardState, say, message.channel)
    }
    if (roundService.isHoleStarted === false) {
      roundService.startHole(scorecardState)
      roundService.scheduleStandingsPost(client)
    }
    if (scorecardState.id !== roundService.currentHole) {
      return
    }
    roundService.recordScore(scorecardState, say)
  })
})()

export {
  validateWordleSubmission
}