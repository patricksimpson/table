App.ApplicationController = Ember.Controller.extend
  needs: ['auth', 'challenge', 'people', 'person', 'wait']
  authBinding: "controllers.auth"
  authedPerson: "controllers.auth.person"
  person: "controllers.person"
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
  ).property('controllers.people.people', 'person', 'controllers.auth.person')
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
    removeResponse: (theChallenge) ->
      challenge = @get('controllers.challenge')
      challenge.removeResponse(theChallenge)
