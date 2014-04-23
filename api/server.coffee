express = require("express")
app = express()

app.get "/game", (req, res) ->
  res.send [
    {
      home: "Player 1"
    }
    {
      away: "Player 2"
    }
  ]
  return

app.listen 3000
console.log "Listening on port 3000..."
