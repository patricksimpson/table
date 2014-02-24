App.ApplicationController = Ember.Controller.extend
  needs: ['auth', 'challenge']
  authBinding: "controllers.auth"
  actions:
    login: ->
      @get('controllers.auth').login()
    logout: ->
      @get('controllers.auth').logout()
    acceptChallenge: (theChallenge) ->
      challenge = @get('controllers.challenge')
      challenge.acceptChallenge(theChallenge)
    declineChallenge: (theChallenge) ->
      challenge = @get('controllers.challenge')
      challenge.declineChallenge(theChallenge)
  waitingList: (->
    console.log "people!"
  ).property('content', 'people')
