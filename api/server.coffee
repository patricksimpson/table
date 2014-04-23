express = require("express")
Firebase = require('firebase')
table = new Firebase('https://thetable.firebaseio.com/')

mytoken = require("./private-token")

FirebaseTokenGenerator = require("firebase-token-generator")
tokenGenerator = new FirebaseTokenGenerator(mytoken)
token = tokenGenerator.createToken({name: "table-api"}, {admin: true})

table.auth(token, (error) ->
  if(error)
    console.log("failed to auth", error)
   else
    console.log("authed.")
)

app = express()
app.get "/match", (req, res) ->
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
app.get "/match/away", (req, res) ->
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
app.get "/match/away/add", (req, res) ->
  awayAdd = table.child('current_games')
  awayAdd.once('value', (nameSnapshot) ->
    game = nameSnapshot.val()
    id = Object.keys(game)[0]
    score = game[id].away_score
    score = score + 1
    game[id].away_score = score
    awayAdd.child(id).set(game[id], =>
      res.send [
        away_score: score
      ]
    )
  )
  return

app.get "/match/home", (req, res) ->
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

app.get "/match/home/add", (req, res) ->
  add = table.child('current_games')
  add.once('value', (nameSnapshot) ->
    game = nameSnapshot.val()
    id = Object.keys(game)[0]
    score = game[id].home_score
    score = score + 1
    game[id].home_score = score
    add.child(id).set(game[id], =>
      res.send [
        home_score: score
      ]
    )
  )
  return

app.get "/match/home/sub", (req, res) ->
  add = table.child('current_games')
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

app.listen 3000
console.log "Listening on port 3000..."
