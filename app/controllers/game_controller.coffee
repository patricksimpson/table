App.GameController = Ember.ObjectController.extend
  needs: ['person']
  addGame: (home, away) ->
    console.log "make me a game..."
    newGame = @get('store').createRecord("pendingGame",
      home: home
      away: away
      created_at: new Date()
    )
    console.log "savin"
    round = @get('store').createRecord("round",
      home_score: 0
      away_score: 0
    )
    newGame.get('rounds').addObject(round)
    newGame.save()
    @newGame(newGame)

  removeGame: (game) ->
    game.delete()

  newGame: (game) ->
    # Check for a current game
    @get('store').fetch('currentGame').then ((currentGame) =>
      console.log "IS THERE A CURRENT GAME?"
      console.log currentGame
      if currentGame.content.length < 1
        @setCurrentGame(game)
    ), (error) =>
      console.log error
      console.log "mega fail"




  setCurrentGame: (pendingGame) ->
    currentGame = @get('store').createRecord('currentGame',
      home: pendingGame.get('home')
      away: pendingGame.get('away')
      created_at: pendingGame.get('created_at')
      started_at: new Date()
    )
    currentGame.save()
    pendingGame.delete()
    @startGame(currentGame)

  startGame: (currentGame) ->
    #Notify players.
    home = currentGame.get('home')
    away = currentGame.get('away')
    console.log home.get('name')
    console.log "vs"
    console.log away.get('name')
    console.log "has started"
    #Tweet

  gameOver: (game) ->
    # Move game to game completed.
