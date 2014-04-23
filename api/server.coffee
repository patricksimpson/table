express = require("express")
path = require("path")
http = require("http")

util = require("util")

twitter = require("twitter")
twit = require('./private-token')

Firebase = require('firebase')
app = express()

app._table = new Firebase('https://thetable.firebaseio.com/')

app._auth = (req) ->
  mytoken = req.query.token
  if mytoken == "" or mytoken is null or mytoken is undefined
    return false
  FirebaseTokenGenerator = require("firebase-token-generator")
  tokenGenerator = new FirebaseTokenGenerator(mytoken)
  token = tokenGenerator.createToken({name: "table-api"})
  app._table.auth(token, (error) ->
    if(error)
      console.log("failed to auth", error)
    else
      console.log("authed.")
  )

#Twitter Watchers
# No one cares about twitter, or thetable.io anyway.
# pingRef = new Firebase('https://thetable.firebaseio.com/waits/')
# pingRef.on('child_added', (childSnapshot, prevChildName) ->
#   waits = childSnapshot.val()
#   console.log waits
#   console.log waits.twitter
#   console.log "someone pinged!"
# )

require('./routes')(app)

app.listen 3000
console.log "Listening on port 3000..."
