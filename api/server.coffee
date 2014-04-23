express = require("express")
Firebase = require('firebase')
table = new Firebase('https://thetable.firebaseio.com/')

auth = (req) ->
  mytoken = req.params.token
  if mytoken == "" or mytoken is null or mytoken is undefined
   return false
  FirebaseTokenGenerator = require("firebase-token-generator")
  tokenGenerator = new FirebaseTokenGenerator(mytoken)
  token = tokenGenerator.createToken({name: "table-api"})
  table.auth(token, (error) ->
    if(error)
      console.log("failed to auth", error)
    else
      console.log("authed.")
  )

app = express()
app.get "/:token/match", (req, res) ->
  auth req
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
app.get "/:token/match/away", (req, res) ->
  auth req
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
app.get "/:token/match/away/add", (req, res) ->
  auth req
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
app.get "/:token/match/away/sub", (req, res) ->
  auth req
  add = table.child('current_games')
  add.once('value', (nameSnapshot) ->
    game = nameSnapshot.val()
    id = Object.keys(game)[0]
    score = game[id].away_score
    score = score - 1
    if score < 0
      res.send [
        error: "You can't go negative."
      ]
      return
    game[id].away_score = score
    add.child(id).set(game[id], =>
      res.send [
        away_score: score
      ]
    )
  )
  return
app.get "/:token/match/home", (req, res) ->
  auth req
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

app.get "/:token/match/home/add", (req, res) ->
  auth req
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

app.get "/:token/match/home/sub", (req, res) ->
  auth req
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
