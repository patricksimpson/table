module.exports = (app) ->
  app.get "/match", (req, res) ->
    app._auth req
    current = app._table.child('current_games')
    current.once('value', (nameSnapshot) ->
      game = nameSnapshot.val()
      id = Object.keys(game)[0]
      home = game[id].home_score
      away = game[id].away_score
      res.send [
        home: home
        away: away
      ]
    )
    return
