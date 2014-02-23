App.ApplicationController = Ember.Controller.extend
  needs: ['auth', 'challenge']
  authBinding: "controllers.auth"
  actions:
    login: ->
      @get('controllers.auth').login()
    logout: ->
      @get('controllers.auth').logout()
  waitingList: (->
    console.log "people!"
  ).property('content', 'people')
  challengeBy: (->
    console.log "a challenge was found"
  ).property('content', 'challenges')
