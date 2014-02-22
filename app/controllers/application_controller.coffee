App.ApplicationController = Ember.Controller.extend
  needs: ['auth']
  authBinding: "controllers.auth"
  actions:
    login: ->
      @get('controllers.auth').login()
    logout: ->
      @get('controllers.auth').logout()
  waitingList: (->
    console.log "people!"
  ).property('content', 'people')
