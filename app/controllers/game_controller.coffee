App.GameController = Ember.ObjectController.extend
  needs: ['person']
  addGame: (home, away) ->
    newGame = @addNewGame(home, away)
    @newGame(newGame)
  removeGame: (game) ->
    game.delete()
  addNewGame: (home, away) ->
    newGame = @get('store').createRecord("pendingGame",
      home: home
      away: away
      createdAt: new Date()
    )
    newGame.save()
    newGame
  createGame: (home, away) ->
    newGame = @addGame(home, away)

  newGame: (game) ->
    # Check for a current game
    @get('store').fetch('currentGame').then ((currentGame) =>
      if currentGame.content.length < 1
        #create a lock here, and hold for the next game in queue.
        theGame = @setCurrentGame(game)
    ), (error) =>
      console.log error
  setCurrentGame: (pendingGame) ->
    newRounds = [
      {
        homeScore: 0
        awayScore: 0
        isCurrent: true
        index: 0
      }
    ]
    currentGame = @get('store').createRecord('currentGame',
      home: pendingGame.get('home')
      away: pendingGame.get('away')
      createdAt: pendingGame.get('createdAt')
      startedAt: new Date()
      homeScore: 0
      awayScore: 0
      rounds: newRounds
    )
    # round = @get('store').createRecord("round",
    #   homeScore: 0
    #   awayScore: 0
    # )
    #round.save()
    currentGame.save()
    @startGame(currentGame)
    @removePending(pendingGame)
    currentGame

  removePending: (pendingGame) ->
    # this fixes a bizare firebase bug. 
    Ember.run.later(pendingGame, =>
      pendingGameId = pendingGame.get('id')
      @get('store').fetch('pendingGame', pendingGameId).then ((pendingGame) ->
        pendingGame.delete()
      )
    , 500)
  startGame: (currentGame) ->
    #Notify players.
    home = currentGame.get('home')
    away = currentGame.get('away')
    #Tweet

  gameOver: (game) ->
    # Move game to game completed.
