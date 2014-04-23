express = require("express")
path = require("path")
http = require("http")

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
pingRef = new Firebase('https://thetable.firebaseio.com/waits/')
pingRef.on('child_added', (childSnapshot, prevChildName) ->
  console.log childSnapshot.val()
  console.log "someone pinged!"
)

require('./routes')(app)

app.listen 3000
console.log "Listening on port 3000..."
