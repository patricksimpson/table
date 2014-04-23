module.exports = (app) ->
  app.get "/match/home/sub", (req, res) ->
    app._auth req
    add = app._table.child('current_games')
    add.once('value', (nameSnapshot) ->
      game = nameSnapshot.val()
      id = Object.keys(game)[0]
      score = game[id].home_score
      score = score - 1
      if score < 0
        res.send [
          error: "You can't go negative."
        ]
        return
      game[id].home_score = score
      add.child(id).set(game[id], =>
        res.send [
          home_score: score
        ]
      )
    )
    return

