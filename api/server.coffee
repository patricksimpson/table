express = require("express")
Firebase = require('firebase')
table = new Firebase('https://thetable.firebaseio.com/')

app = express()
app.get "/game", (req, res) ->
  current = table.child('current_games')
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
app.get "/game/away", (req, res) ->
  away = table.child('current_games')
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

app.get "/game/home", (req, res) ->
  home = table.child('current_games')
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

app.listen 3000
console.log "Listening on port 3000..."
