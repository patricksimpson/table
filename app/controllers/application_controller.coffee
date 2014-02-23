App.ApplicationController = Ember.Controller.extend
  needs: ['auth', 'challenge']
  authBinding: "controllers.auth"
  actions:
    login: ->
      @get('controllers.auth').login()
    logout: ->
      @get('controllers.auth').logout()
    acceptChallenge: ->
      console.log "challengeAccepted"
    declineChallenge: ->
      console.log "Declined Challenge"
  waitingList: (->
    console.log "people!"
  ).property('content', 'people')
