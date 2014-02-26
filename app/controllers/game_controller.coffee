App.GameController = Ember.ObjectController.extend
  needs: ['person']
  addGame: (home, away) ->
    newGame = @get('store').createRecord("game",
      home: home
      away: away
      is_complete: false
      is_pending: true
      created_at: new Date()
    )
    round = @get('store').createRecord("round", 
      home_score: 0
      away_score: 0
      content: newGame
    )
    newGame.get('rounds').addObject(round)
    newGame.save()
  removeGame: (game) ->
    game.delete()