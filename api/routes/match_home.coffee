module.exports = (app) ->
  app.get "/match/home", (req, res) ->
    app._auth req
    home = app._table.child('current_games')
    home.once('value', (nameSnapshot) ->
      game = nameSnapshot.val()
      id = Object.keys(game)[0]
      home = game[id].home
      homeName = table.child('people/' + home)
      homeName.once('value', (nameSnapshot) ->
        person = nameSnapshot.val()
        res.send [
          name: person.name
        ]
      )
    )
    return

