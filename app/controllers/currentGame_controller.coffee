App.CurrentGameController = Ember.ObjectController.extend
  needs: ['person', 'people', 'auth']
  currentRound: 1
  authPerson: Ember.computed.alias('controllers.auth.person')
  confirmEndMatch: false
  message: ""
  roundsWithIndex: ( ->
    rounds = @get('rounds')
    authPerson = @get('authPerson')
    game = @get('model')
    homePerson = game.get('home')
    awayPerson = game.get('away')
    @set('isMe', false)
    if authPerson?
      if authPerson.get('id') == homePerson.get('id') or authPerson.get('id') == awayPerson.get('id')
        @set('isMe', true)
    if !rounds?
      @transitionTo("/games")
      return
    currentRound = @get('currentRound')
    @set('currentRound', rounds.length)
    
    @get('rounds').map((round, index) =>
      round:
        homeWon: round.homeScore > round.awayScore
        awayWon: round.homeScore < round.awayScore
        homeScore: round.homeScore
        awayScore: round.awayScore
        isComplete: round.isComplete
        isCurrent: (index + 1) == currentRound
        isMe: @get('isMe')
      index: index + 1
    ).reverse()
  ).property('rounds', 'authPerson', 'content')
  gameOver: ->
    game = @get('model')
    completedGame = @get('store').createRecord("completedGame",
      home: game.get('home')
      away: game.get('away')
      createdAt: game.get('createdAt')
      startedAt: game.get('startedAt')
      homeScore: game.get('homeScore')
      awayScore: game.get('awayScore')
      rounds: game.get('rounds')
      completedAt: new Date()
    )
    completedGame.save()

    homePerson = game.get('home')
    awayPerson = game.get('away')

    tweetCompleted = @get('store').createRecord('completedRequest',
      home: homePerson.get('twitter')
      away: awayPerson.get('twitter')
      homeScore: game.get('homeScore')
      awayScore: game.get('awayScore')
    )
    tweetCompleted.save()

    game.delete()
    @transitionTo('/')
  actions:
    addPointHome: ->
      game = @get('model')
      currentRound = @get('currentRound')
      currentRoundIndex = currentRound - 1
      #Get rounds, and current round.
      rounds = game.get('rounds')
      @set('currentRound', rounds.length)
      round = rounds[currentRoundIndex]
      #Add pointz
      score = round.homeScore
      score = score + 1
      #create new round object 
      updatedRounds =
        homeScore: score
        awayScore: round.awayScore
        isComplete: false
        isCurrent: true

      #set the round object, and save.
      rounds[currentRoundIndex] = updatedRounds
      game.set('rounds', rounds.toArray())
      game.save()
    subtractPointHome: ->
      game = @get('model')
      currentRound = @get('currentRound')
      currentRoundIndex = currentRound - 1
      #Get rounds, and current round
      rounds = game.get('rounds')
      @set('currentRound', rounds.length)
      round = rounds[currentRoundIndex]
      #Subtract score 
      score = round.homeScore
      score = score - 1
      if score < 0
        return
      #create new round object
      updatedRounds =
        homeScore: score
        awayScore: round.awayScore
        isComplete: false
        isCurrent: true

      #set the round object and save
      rounds[currentRoundIndex] = updatedRounds
      game.set('rounds', rounds.toArray())
      game.save()
    addPointAway: ->
      game = @get('model')
      currentRound = @get('currentRound')
      currentRoundIndex = currentRound - 1
      #Get rounds, and current round
      rounds = game.get('rounds')
      @set('currentRound', rounds.length)
      round = rounds[currentRoundIndex]
      #Add points
      score = round.awayScore
      score = score + 1
      #create new round object
      updatedRounds =
        homeScore: round.homeScore
        awayScore: score
        isComplete: false
        isCurrent: true

      #set the round obect and save.
      rounds[currentRoundIndex] = updatedRounds
      game.set('rounds', rounds.toArray())
      game.save()
    subtractPointAway: ->
      game = @get('model')
      currentRound = @get('currentRound')
      currentRoundIndex = currentRound - 1
      #Get rounds, and current round
      rounds = game.get('rounds')
      @set('currentRound', rounds.length)
      round = rounds[currentRoundIndex]
      #Subtract points
      score = round.awayScore
      score = score - 1
      if score < 0
        return
      #create new round object
      updatedRounds =
        homeScore: round.homeScore
        awayScore: score
        isComplete: false
        isCurrent: true

      #set the round obect and save.
      rounds[currentRoundIndex] = updatedRounds
      game.set('rounds', rounds.toArray())
      game.save()

    endRound: (round) ->
      game = @get('model')
      currentRound = @get('currentRound')
      currentRoundIndex = currentRound - 1
      if round.homeScore > round.awayScore + 1
        score = game.get('homeScore')
        score = score + 1
        rounds = game.get('rounds')
        @set('currentRound', rounds.length)
        currentRound= rounds[currentRoundIndex]
        updatedRounds =
          homeScore: currentRound.homeScore
          awayScore: currentRound.awayScore
          isComplete: true

        rounds[currentRoundIndex] = updatedRounds
        game.set('rounds', rounds.toArray())
        game.set('homeScore', score)
        game.save()
        return
      if round.awayScore  > round.homeScore + 1
        score = game.get('awayScore')
        score = score + 1
        rounds = game.get('rounds')
        @set('currentRound', rounds.length)
        currentRound = rounds[currentRoundIndex]
        updatedRounds =
          homeScore: currentRound.homeScore
          awayScore: currentRound.awayScore
          isComplete: true
        rounds[currentRoundIndex] = updatedRounds
        game.set('rounds', rounds.toArray())
        game.set('awayScore', score)
        game.save()
        return
      console.log "Must win by 2, cannot be a tie/draw"
      return false
    newRound: ->
      game = @get('model')
      rounds = game.get('rounds').toArray()
      new_round =
        homeScore: 0
        awayScore: 0
        isComplete: false
      rounds.push(new_round)
      game.set('rounds', rounds)
      game.save()
    confirmEndGame: ->
      @set('confirmEndMatch', true)
    undoEndGame: ->
      @set('confirmEndMatch', false)
    endGame: ->
      game = @get('model')
      homePerson = game.get('home')
      awayPerson = game.get('away')
      #And the winner is..
      if game.get('homeScore') > game.get('awayScore')
        wins = homePerson.get('wins')
        if not wins? or wins == NaN
          wins = 0
        loss = awayPerson.get('losses')
        if not loss? or loss == NaN
          loss = 0
        w = wins + 1
        l = loss + 1
        homePerson.set('wins', w)
        awayPerson.set('losses',l)
        homePerson.save()
        awayPerson.save()
        @gameOver()
      if game.get('homeScore') < game.get('awayScore')
        wins = awayPerson.get('wins')
        if not wins? or wins == NaN
          wins = 0
        loss = homePerson.get('losses')
        if not loss? or loss == NaN
          loss = 0
        w = wins + 1
        l = loss + 1
        awayPerson.set('wins', w)
        homePerson.set('losses',l)
        homePerson.save()
        awayPerson.save()
        @gameOver()
      return
    cancelGame: ->
      game = @get('model')
      game.delete()
      @transitionTo("/")
