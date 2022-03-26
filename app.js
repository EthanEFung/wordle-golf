import bolt from '@slack/bolt';
import validation from './middlewares/validation.js'
import RoundService from './services/round.js';
import ScoreService from './services/score.js'
import dotenv from 'dotenv';
dotenv.config()

const { App } = bolt

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

(async () => {
  const roundService = new RoundService();
  await app.start(process.env.PORT || 3000);
  console.log('bolt app is running')
  roundService.recover(app)
  app.message(validation, async function parseWordle({message, say, client})  {
    /**
     * The known issue with the validation middleware is that it cannot determine 
     * if the Wordle submission is today's submission. This can only be determined
     * by checking to see if the round has started and whether the hole is started.
     * Only when we have determined these two factors are true or that the user is
     * attempting to start a round or hole can we assume the validity of the
     * Wordle submission.
     */
    const scoreCtrl = new ScoreService()
    const scoreState = scoreCtrl.tally(message)

    if (roundService.isRoundStarted === false) {
      await roundService.startRound(scoreState, say, message.channel)
    }
    if (roundService.isHoleStarted === false) {
      roundService.startHole(scoreState)
      roundService.scheduleStandingsPost(client)
    }
    if (scoreState.id !== roundService.currentHole) {
      return
    }
    roundService.recordScore(scoreState, say)
  })
})()
