# Game Rules
## Objective
The objective is to be the player at the end of the round with the lowest score

## Terms
- Channel: the Slack channel the bot is monitoring
- Hole: This refers to the Wordle of the current day
- Round: This refers to 9 or 18 holes of wordle
- Score: The number of attempts to guess the word in a game of wordle
- Scorecard: The end users tally of scores for a round
- Submission: This is the first valid Wordle text end users will submit to Slack.
- Standing: How the end user scorecard is performining in comparison to the other players
- Player: A slack user who has made at least one submission for the current round.

## How to play
Each day is a "Hole" of Wordle. 1 round of Wordle Golf comprises of 9 holes. You have until the end of the day to make a submission, at which each player's submission will be tallied on their scorecard.

## FAQ
### What if I forget to my daily submission for a round?

### What if I join a round of golf a day or two late? 
We consider any missed days as a hole "not played". No worries


# Product Requirements
1. If there is no current round of golf that is being played, then the first user to make  a submission begins the round. 
2. Only the current days hole counts towards the players score.
3. At midnight PST, if there is a current round being played, the product should tally the scores 
4. In the morning at 9:15am PST a message should be sent to the channel communicating the round standings.
5. When communicating standings
    - the list should be sorted by lowest scorecard ascendingly
    - the user name should be displayed
    - the scorecard prior to the hole
6. At the end of 9 holes, the round should end and the winners should be announced!
7. The User should have the ability to interact with the slack channel without any interference of the bot. Users should be able to comment on other peoples scores, add comments, react, etc.

## Messages
10:00 AM 
- Good Morning Golfers! Here are the standings for the round.
  - @EthanEFung: 5+5+3 -> 13
  - @JeffreyLee: 7+5+4 -> 16
  You have {n} holes left to play in the round

10:00 AM after the last round
- Congrats @MinahJin ! You've won the round
  - @MinahJin: 4+3+2 -> 
  - @EthanEFung: 4+7+6 -> 17
  - @JeffreyLee: 12+4 -> 16

After your valid submission:
Genius, 4+3+1 -> 8 

/standings
  - @EthanEFung: 5+5+3 -> 13
  - @JeffreyLee: 7+5+4 -> 16
