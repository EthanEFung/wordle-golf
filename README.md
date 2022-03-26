# Game Rules
Like traditional golf, the objective of this game is to be the player at the end of the round with the lowest score.

## How to play
After playing today's [Wordle](https://www.nytimes.com/games/wordle/index.html). Click the green share button and share your results with this channel. Wordle-Bot should respond to you by notifying the channel of your scores. Each daily Wordle is a "hole", one "round" of Wordle Golf is three holes and your final score is the sum of your attempts over those three Wordle submissions.

You have until the end of the day to make a submission, at which each player's submission will be tallied on their scorecard. At the end of the round, the player with the lowest score is the winner!

## FAQ

### What if I forget to play a hole when others have?
If a hole has not been played in the round, then a score of 7 is added to the players scorecard.
### What if I join a round of golf a day or two late? 
A score of 7 is added per hole not played

### What if no one plays one day of wordle?
Oh..well, Wordle-Bot understands and won't count that day as a hole played. If a round is not finished, Wordle-Bot waits for someone to post a score before assuming users want to progress the round.

## Questions?
Questions or Suggestions? DM Ethan for more information.

## Terms
- Channel: the Slack channel the bot is monitoring
- Hole: This refers to the Wordle of the current day
- Round: This refers to the 3 holes of wordle
- Score: The number of attempts to guess the word in a game of wordle
- Scorecard: A end users tally of scores for a round
- Submission: This is the first valid Wordle text end users will submit to Slack.
- Standing: How the end user scorecard is performining in comparison to the other players
- Player: A slack user who has made at least one submission for the current round.



# Product Requirements
1. If there is no current round of golf that is being played, then the first user to make  a submission begins the round. 
2. Only the current days hole counts towards the players score.
3. At midnight PST, if there is a current round being played, the product should tally the scores and the current round should restart
4. In the morning at 8:00am PST a message should be sent to the channel communicating the round standings.
5. When communicating standings
    - the list should be sorted by lowest scorecard ascendingly
    - the user name should be displayed
    - the scorecard prior to the hole
6. At the end of 3 holes, the round should end and the winners should be announced!
7. The User should have the ability to interact with the slack channel without any interference of the bot. Users should be able to comment on other peoples scores, add comments, react, etc.
