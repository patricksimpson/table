App.ApplicationController = Ember.Controller.extend
  needs: ['auth']
  authBinding: "controllers.auth"
  actions:
    login: ->
      @get('controllers.auth').login()
    logout: ->
      @get('controllers.auth').logout()
