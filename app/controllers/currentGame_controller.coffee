App.CurrentGameController = Ember.ObjectController.extend
  needs: ['person', 'people', 'auth', 'challenge', 'application', 'game']
  currentRound: 1
  authPerson: Ember.computed.alias('controllers.auth.person')
  game: Ember.computed.alias('controllers.game')
  confirmEndMatch: false
  message: ""
  gameOverFlag: false
  gameStartedFlag: false
  confirmOpenRound: false
  people: []
  getPeople: (->
    people = []
    @set('people', people)
    @get('store').fetch('person').then (peopleList) =>
      people = peopleList.map (person) =>
       person
      @set('people', people)
    return ""
  ).property('getPeople')
  cancelGameConfirm: false
  startUp: ( ->
    @reset()
  ).on('init')
  reset: ->
    @set('gameOverFlag', false)
    @set('gameStartedFlag', false)
    @set('confirmOpenRound', false)
    @set('message', "")
    @set('confirmEndMatch', false)
    @set('currentRound', 1)

  isActiveGame: Ember.computed.alias('controllers.application.isActiveGame')
  roundsWithIndex: ( ->
    if @get('gameOverFlag')
      return false
    rounds = @get('rounds')
    authPerson = @get('authPerson')
    game = @get('model')
    @set('gameStartedFlag', true)
    @recountMatchScores()
    homePerson = game.get('home')
    awayPerson = game.get('away')
    @set('isMe', false)
    if authPerson?
      if authPerson.get('id') == homePerson.get('id') or authPerson.get('id') == awayPerson.get('id')
        @set('isMe', true)
    if !rounds?
      if(!@get('authPerson').get('id') == "1410921259")
        @transitionToRoute("/games")
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
    @set('gameOverFlag', true)
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
    @transitionToRoute('/games')
  recountMatchScores: ->
    if @get('gameOverFlag')
      return
    if !@get('gameStartedFlag')
      return
    game = @get('model')
    rounds = game.get('rounds')
    if rounds == undefined or rounds == null or !rounds
      return

    rounds = rounds.toArray()
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
  computePoint:(which, add) ->
    game = @get('model')
    currentRound = game.get('currentRound')
    currentRoundIndex = currentRound - 1
    #Get rounds, and current round.
    rounds = game.get('rounds')
    @set('currentRound', rounds.length)
    round = rounds[currentRoundIndex]
    if add
      if which == "home"
        round.homeScore = round.homeScore + 1
      else
        round.awayScore = round.awayScore + 1
    else
      if which == "home"
        round.homeScore = round.homeScore - 1
        if round.homeScore < 0
          return
      else
        round.awayScore = round.awayScore - 1
        if round.awayScore < 0
          return
    updatedRounds =
      homeScore: round.homeScore
      awayScore: round.awayScore
      isComplete: false
      isCurrent: true
      index: currentRoundIndex
    rounds[currentRoundIndex] = updatedRounds
    game.set('rounds', rounds.toArray())
    game.save()
  changeScore: (score, which) ->
    if score < 0
      return
    if score > 99
      return
    game = @get('model')
    currentRound = game.get('currentRound')
    currentRoundIndex = currentRound - 1
    rounds = game.get('rounds')
    round = rounds[currentRoundIndex]
    homeScore = round.homeScore
    awayScore = round.awayScore
    if which == "home"
      homeScore = score
    else
      awayScore = score
    updatedRounds =
      homeScore: score * 1
      awayScore: round.awayScore
      isComplete: false
      isCurrent: true
      index: currentRoundIndex

    rounds[currentRoundIndex] = updatedRounds
    game.set('rounds', rounds.toArray())
    game.save()
    $('.button').removeClass("disabled")
    $('#activeGameContainer').removeClass("scoring--active")
      
  actions:
    addPointHome: ->
      @computePoint("home", true)
    subtractPointHome: ->
      @computePoint("home", false)
    addPointAway: ->
      @computePoint("away", true)
    subtractPointAway: ->
      @computePoint("away", false)
    homeScoreChanges: (score) ->
      if score == ""
        $('.score--home').val(@get('tempHomeScore'))
        score = @get('tempHomeScore')
      @changeScore(score, "home")

    awayScoreChanges: (score) ->
      if score == ""
        $('.score--away').val(@get('tempAwayScore'))
        score = @get('tempAwayScore')
      @changeScore(score, "home")

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
      @set('gameOverFlag', true)
      game = @get('model')
      game.delete()
      @transitionToRoute("/games")
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
      if round.index < 0
        console.log "round index is less than 0?"
        return
      currentRoundIndex = game.get('currentRound')
      rounds = game.get('rounds')
      rounds = rounds.toArray()
      if currentRoundIndex > 1
        currentRoundIndex = currentRoundIndex - 2
      else
        currentRoundIndex = 0
      oldRound = rounds[currentRoundIndex]
      @openRound(oldRound)
      @recountMatchScores()
    openRoundAction: (round)->
      @openRound(round)
    clearTempHome: (val) ->
      $('.score--home').val("")
      @set('tempHomeScore', val)
      $('.modal--scoring').show()
      $('#activeGameContainer').addClass("scoring--active")
      $('.button').addClass("disabled")
    clearTempAway: (val) ->
      $('.score--away').val("")
      @set('tempAwayScore', val)
      $('.modal--scoring').show()
      $('#activeGameContainer').addClass("scoring--active")
      $('.button').addClass("disabled")
      
