App.ApplicationController = Ember.Controller.extend
  needs: ['auth', 'challenge', 'people', 'person', 'wait', 'game']
  authBinding: "controllers.auth"
  waitList: Ember.computed.alias('controllers.wait')
  game: Ember.computed.alias('controllers.game')
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
    removeResponse: (theChallenge) ->
      challenge = @get('controllers.challenge')
      challenge.removeResponse(theChallenge)
