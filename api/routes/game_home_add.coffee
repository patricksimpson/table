module.exports = (app) ->
  app.get "/game/home/add", (req, res) ->
    app._auth req
    add = app._table.child('current_games')
    add.once('value', (nameSnapshot) ->
      game = nameSnapshot.val()
      id = Object.keys(game)[0]
      rounds = game[id].rounds
      roundNumber = rounds.length - 1
      score = rounds[roundNumber].homeScore
      score = score + 1
      rounds[roundNumber].homeScore = score
      game[id].rounds = rounds
      add.child(id).set(game[id], =>
        res.send [
          homeScore: score
          currentRound: roundNumber
        ]
      )
    )
    return

