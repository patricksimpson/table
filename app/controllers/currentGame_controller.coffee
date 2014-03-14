App.CurrentGameController = Ember.ObjectController.extend
  needs: ['person', 'people', 'auth', 'challenge', 'application']
  currentRound: 1
  authPerson: Ember.computed.alias('controllers.auth.person')
  confirmEndMatch: false
  message: ""
  gameOverFlag: false
  confirmOpenRound: false
  cancelGameConfirm: false
  isActiveGame: Ember.computed.alias('controllers.application.isActiveGame')
  roundsWithIndex: ( ->
    rounds = @get('rounds')
    authPerson = @get('authPerson')
    game = @get('model')
    @recountMatchScores()
    homePerson = game.get('home')
    awayPerson = game.get('away')
    @set('isMe', false)
    if authPerson?
      if authPerson.get('id') == homePerson.get('id') or authPerson.get('id') == awayPerson.get('id')
        @set('isMe', true)
    if !rounds?
      if(!@get('authPerson').get('id') == "1410921259")
        @transitionTo("/games")
      return
    currentRound = game.get('currentRound')
    @get('rounds').map((round, index) =>
      round:
        homeWon: round.homeScore > round.awayScore
        awayWon: round.homeScore < round.awayScore
        homeScore: round.homeScore
        awayScore: round.awayScore
        index: index
        hIndex: index + 1
        isComplete: round.isComplete
        isCurrent: (index + 1) == currentRound
        isFirst: index == 0
        isMe: @get('isMe')
      index: index + 1
    ).reverse()
  ).property('rounds', 'content', 'authPerson')
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
    @transitionTo('/games')
  recountMatchScores: ->
    game = @get('model')
    rounds = game.get('rounds').toArray()
    #recalc score...
    recountAwayScore = 0
    recountHomeScore = 0
    for round in rounds
      if not round.isCurrent
        if round.awayScore > round.homeScore
          recountAwayScore++
        else
          if round.homeScore > round.awayScore
            recountHomeScore++
          else
            console.log "Scoring error, scores equal or not valid."

    game.set('awayScore', recountAwayScore)
    game.set('homeScore', recountHomeScore)
    game.save()
    @set('awayScore', recountAwayScore)
    @set('homeScore', recountHomeScore)
  openRound: (round) ->
    @set('confirmOpenRound', false)
    game = @get('model')
    if round.index == undefined
      console.log "ERROR WITH INDEX?"
      return
    newRoundIndex = round.index
    howManyToPop = (game.get('currentRound') - 1) - newRoundIndex
    rounds = game.get('rounds')
    rounds = rounds.toArray()
    homeScoreSubtract = 0
    awayScoreSubtract = 0
    i = 0
    while i < howManyToPop
      rewindRound = rounds.pop()
      if rewindRound.isComplete
        if rewindRound.homeScore > rewindRound.awayScore
          homeScoreSubtract++
        else
          if rewindRound.awayScore > rewindRound.homeScore
            awayScoreSubtract++
      i++
    @set('currentRound', newRoundIndex + 1)
    theRound = rounds.pop()
    if theRound.homeScore > theRound.awayScore
      homeScoreSubtract++
    else
      awayScoreSubtract++
    #now we have the subtract amount, let's set the new score.
    oldHomeScore = game.get('homeScore')
    oldAwayScore = game.get('awayScore')
    game.set('homeScore', oldHomeScore - homeScoreSubtract)
    game.set('awayScore', oldAwayScore - awayScoreSubtract)
    #Now we set this as the current round, and save the game.
    rounds.push(
      homeScore: theRound.homeScore
      awayScore: theRound.awayScore
      isComplete: false
      isCurrent: true
      index: newRoundIndex
    )
    game.set('rounds', rounds)
    game.save()
  actions:
    addPointHome: ->
      game = @get('model')
      currentRound = game.get('currentRound')
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
        index: currentRoundIndex

      #set the round object, and save.
      rounds[currentRoundIndex] = updatedRounds
      game.set('rounds', rounds.toArray())
      game.save()
    subtractPointHome: ->
      game = @get('model')
      currentRound = game.get('currentRound')
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
        index: currentRoundIndex

      #set the round object and save
      rounds[currentRoundIndex] = updatedRounds
      game.set('rounds', rounds.toArray())
      game.save()
    addPointAway: ->
      game = @get('model')
      currentRound = game.get('currentRound')
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
        index: currentRoundIndex

      #set the round obect and save.
      rounds[currentRoundIndex] = updatedRounds
      game.set('rounds', rounds.toArray())
      game.save()
    subtractPointAway: ->
      game = @get('model')
      currentRound = game.get('currentRound')
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
        index: currentRoundIndex
        
      #set the round obect and save.
      rounds[currentRoundIndex] = updatedRounds
      game.set('rounds', rounds.toArray())
      game.save()
    homeScoreChanges: (score) ->
      if score == ""
        $('.score--home').val(@get('tempHomeScore'))
        score = @get('tempHomeScore')
      if score < 0
        return
      if score > 99
        return
      game = @get('model')
      currentRound = game.get('currentRound')
      currentRoundIndex = currentRound - 1
      rounds = game.get('rounds')
      round = rounds[currentRoundIndex]
      updatedRounds =
        homeScore: score * 1
        awayScore: round.awayScore
        isComplete: false
        isCurrent: true
        index: currentRoundIndex

      rounds[currentRoundIndex] = updatedRounds
      game.set('rounds', rounds.toArray())
      game.save()
    awayScoreChanges: (score) ->
      console.log score
      if score == ""
        $('.score--away').val(@get('tempAwayScore'))
        score = @get('tempAwayScore')
      if score < 0
        return
      if score > 99
        return
      game = @get('model')
      currentRound = game.get('currentRound')
      currentRoundIndex = currentRound - 1
      rounds = game.get('rounds')
      round = rounds[currentRoundIndex]
      updatedRounds =
        homeScore: round.homeScore
        awayScore: score * 1
        isComplete: false
        isCurrent: true
        index: currentRoundIndex

      rounds[currentRoundIndex] = updatedRounds
      game.set('rounds', rounds.toArray())
      game.save()

    endRound: (round) ->
      game = @get('model')
      currentRound = game.get('currentRound')
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
          index: currentRoundIndex
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
          index: currentRoundIndex

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

      @recountMatchScores()

      new_round =
        homeScore: 0
        awayScore: 0
        isComplete: false
        index: rounds.length - 1
        isCurrent: true

      rounds.push(new_round)
      game.set('rounds', rounds)
      game.save()
    confirmEndGame: ->
      @set('confirmEndMatch', true)
    undoEndGame: ->
      @set('confirmEndMatch', false)
    endGame: ->
      @set('gameOverFlag', true)
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
      @set('cancelGameConfirm', false)
      game = @get('model')
      game.delete()
      @transitionTo("/games")
    cancelGameConfirm: ->
      @set('cancelGameConfirm', true)
    undoCancelGameConfirm: ->
      @set('cancelGameConfirm', false)
    confirmOpenRoundAction: ->
      @set('confirmOpenRound', true)
    cancelConfirmOpenRoundAction: ->
      @set('confirmOpenRound', false)
    cancelRound: (round) ->
      game = @get('model')
      if round.index < 1
        return
      currentRoundIndex = game.get('currentRound')
      rounds = game.get('rounds')
      rounds = rounds.toArray()
      if currentRoundIndex > 1
        currentRoundIndex = currentRoundIndex - 2
      oldRound = rounds[currentRoundIndex]
      @openRound(oldRound)
      @recountMatchScores()
    openRoundAction: (round)->
      @openRound(round)
    clearTempHome: (val) ->
      $('.score--home').val("")
      @set('tempHomeScore', val)
    clearTempAway: (val) ->
      $('.score--away').val("")
      @set('tempAwayScore', val)

      
