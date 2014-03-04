App.ApplicationController = Ember.Controller.extend
  clock: 'components/clock'
  needs: ['auth', 'challenge', 'people', 'person', 'wait', 'game']
  authBinding: "controllers.auth"
  waitList: Ember.computed.alias('controllers.wait')
  game: Ember.computed.alias('controllers.game')
  currentGames: (->
    @get('currentGame').map((game) =>
      startedAt = game.get('startedAt')
      game.set('time', moment(startedAt).fromNow())
      game
    )
  ).property('currentGame.content.@each', 'clock.minute')
  waitingList: (->
    @get('waits').map (wait) =>
      wait.set 'updatetime', new Date()
      wait.get('person')
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
    c = @get('challengeData').map((challenge) =>
      homePerson = challenge.get('home')
      auth_id = @get('controllers.auth.person.id')
      if auth_id?
        challenge.set('isMe', auth_id == homePerson.get('id'))
      challenge
    )
    return c
  ).property('challengeData.content.@each', 'controllers.auth.person')
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
