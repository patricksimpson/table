module.exports = (app) ->
  app.get "/match/away", (req, res) ->
    app._auth req
    away = app._table.child('current_games')
    away.once('value', (nameSnapshot) ->
      game = nameSnapshot.val()
      id = Object.keys(game)[0]
      away = game[id].away
      awayName = table.child('people/' + away)
      awayName.once('value', (nameSnapshot) ->
        person = nameSnapshot.val()
        res.send [
          name: person.name
        ]
      )
    )
    return
