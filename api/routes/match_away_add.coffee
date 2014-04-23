module.exports = (app) ->
  app.get "/match/away/add", (req, res) ->
    app._auth req
    awayAdd = app._table.child('current_games')
    awayAdd.once('value', (nameSnapshot) ->
      game = nameSnapshot.val()
      id = Object.keys(game)[0]
      score = game[id].away_score
      score = score + 1
      game[id].away_score = score
      awayAdd.child(id).set(game[id], =>
        res.send [
          awayScore: score
        ]
      )
    )
    return
