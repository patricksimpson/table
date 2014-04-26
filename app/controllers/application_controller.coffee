App.ApplicationController = Ember.Controller.extend
  clock: 'components/clock'
  needs: ['auth', 'challenge', 'people', 'person', 'wait', 'game', 'currentGame']
  authBinding: "controllers.auth"
  waitList: Ember.computed.alias('controllers.wait')
  isChallengePopup: false
  game: Ember.computed.alias('controllers.game')
  currentGames: (->
    currentGames = @get('currentGame').map((game) =>
      startedAt = game.get('startedAt')
      game.set('time', moment(startedAt).fromNow())
      auth_id = @get('controllers.auth.person.id')
      if auth_id
        homePerson = game.get('home')
        awayPerson = game.get('away')
        if (auth_id == homePerson.get('id')) or (auth_id == awayPerson.get('id'))
          ctlCurrentGame = @get('controllers.currentGame')
          ctlCurrentGame.reset()
          @transitionToRoute('currentGame')
      game
    )
    @set('isActiveGame', currentGames.length > 0)
    return currentGames
  ).property('currentGame.content.@each', 'clock.minute', 'controllers.auth.person')
  waitingList: (->
    theWaits = @get('waits')
    @get('waits').map (wait) =>
      person = wait.get('person')
      auth_id = @get('controllers.auth.person.id')
      if auth_id
        if auth_id == person.get('id')
          wait.set 'isMe', true
      else
        wait.set 'isMe', false
      date = wait.get('createdAt')
      wait.set('time', moment(date).fromNow())
      wait
  ).property('waits.content.@each', 'controllers.person.content', 'controllers.auth.person', 'clock.minute')
  pendingChallenges: (->
    cd = @get('challengeData')
    c = @get('challengeData').map((challenge) =>
      homePerson = challenge.get('home')
      awayPerson = challenge.get('away')
      date = challenge.get('createdAt')
      challenge.set('time', moment(date).fromNow())
      auth_id = @get('controllers.auth.person.id')
      if auth_id?
        challenge.set('isMe', auth_id == homePerson.get('id'))
      challenge
    )
    return c
  ).property('challengeData.content.@each', 'controllers.auth.person', 'clock.minute')
  myChallenges: (->
    mc = @get('controllers.auth.person.challenges')
    if mc?
      newMc = mc.filter (challenge) =>
        challenge.get('id') != "undefined"
      return newMc
    return false
  ).property('controllers.auth.person.challenges.@each', 'controllers.auth.person')
  pendingGames: (->
    games = @get('pendingGameData').map((game) =>
      awayPerson = game.get('away')
      homePerson = game.get('home')
      game.set('isEmpty', @get('currentGames').length < 1)
      auth_id = @get('controllers.auth.person.id')
      if auth_id?
        game.set('isMe', (auth_id == homePerson.get('id')) or (auth_id == awayPerson.get('id')))
      date = game.get('createdAt')
      game.set('time', moment(date).fromNow())
      game
    )
    return games
  ).property('currentGames', 'pendingGameData.content.@each', 'controllers.auth.person')
  actions:
    challengePopup: (show) ->
      @set('isChallengePopup', show)
    personJoinWaitingList: ->
      authPerson = @get('controllers.auth.person')
      @get('controllers.person').ping(authPerson)
    personCancelWaitingList: ->
      authPerson = @get('controllers.auth.person')
      @get('controllers.person').cancelPing(authPerson)
    login: ->
      @get('controllers.auth').login()
    logout: ->
      @get('controllers.auth').logout()
    acceptGame: (home, away) ->
      @get('game').addGame(home, away)
      @get('waitList').removePerson(home)
      home.set('isWaiting', false)
      home.save()
    startPendingGame: (theGame) ->
      game = @get('controllers.game')
      game.startPendingGame(theGame)
      ctlCurrentGame = @get('controllers.currentGame')
      ctlCurrentGame.reset()

    cancelPendingGame: (theGame) ->
      game = @get('controllers.game')
      game.removePending(theGame)
    acceptChallenge: (theChallenge) ->
      challenge = @get('controllers.challenge')
      challenge.acceptChallenge(theChallenge)
    declineChallenge: (theChallenge) ->
      challenge = @get('controllers.challenge')
      challenge.declineChallenge(theChallenge)
    cancelChallenge: (theChallenge) ->
      challenge = @get('controllers.challenge')
      challenge.removeChallenge(theChallenge)
    removeResponse: (theChallenge) ->
      challenge = @get('controllers.challenge')
      challenge.removeResponse(theChallenge)
