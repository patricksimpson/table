App.GameController = Ember.ObjectController.extend
  needs: ['person']
  pendingGame: false
  currentGame: false
  addGame: (home, away) ->
    newGame = @addNewGame(home, away)
    @set('pendingGame', newGame)
    @checkCurrent()
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
    @addNewGame(home, away)
  checkCurrent: ->
    # Check for a current game
    @get('store').fetch('currentGame').then ((currentGame) =>
        if currentGame.content.length > 0
          @set('currentGame', currentGame)
        else
          @set('currentGame', false)
          @newGame()
    ), (error) =>
      @set('currentGame', false)
  startPendingGame: (game) ->
    @set('pendingGame', game)
    @checkCurrent()
  newGame: ->
    if !@get('currentGame') && @get('pendingGame')
      @setCurrentGame()
    else
      console.log "No games to add?"
  setCurrentGame: ->
    pendingGame = @get('pendingGame')
    @set('pendingGame', false)
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
    currentGame.save()
    @startGame(currentGame)
    @removePending(pendingGame)
    @set('currentGame', currentGame)
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

  gameOver: (game) ->
    # Move game to game completed.
