App.ApplicationController = Ember.Controller.extend
  clock: 'components/clock'
  needs: ['auth', 'challenge', 'people', 'person', 'wait', 'game']
  authBinding: "controllers.auth"
  waitList: Ember.computed.alias('controllers.wait')
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
      wait
  ).property('waits.content.@each', 'controllers.person.content', 'controllers.auth.person')
  pendingChallenges: (->
    cd = @get('challengeData')
    c = @get('challengeData').map((challenge) =>
      homePerson = challenge.get('home')
      awayPerson = challenge.get('away')
      auth_id = @get('controllers.auth.person.id')
      if auth_id?
        challenge.set('isMe', auth_id == homePerson.get('id'))
      challenge
    )
    return c
  ).property('challengeData.content.@each', 'controllers.auth.person')
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
      game
    )
    return games
  ).property('currentGames', 'pendingGameData.content.@each', 'controllers.auth.person')
  actions:
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
      game.newGame(theGame)
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
