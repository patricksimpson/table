App.ApplicationController = Ember.Controller.extend
  needs: ['auth', 'challenge', 'people', 'person']
  authBinding: "controllers.auth"
  setupWaiting: (->
    @updateWaitingList()
    console.log "setting up.."
  ).on('init')
  waits: (->
   console.log("waiting list change?")
   @updateWaitingList()
   @get('waitingList')
  ).property('content', 'controllers.people.content.@each')
  updateWaitingList: ->
   console.log ("GET WAITING LIST")
   @set('waitingList', [])
   @get('store').fetch('person').then (people) =>
     waitingList = []
     for person in people.content
       if person.get('is_waiting')
         console.log person.get('name') + " is waiting............."
         waitingList.push person
     waitingList.sort (a, b) ->
       console.log "sort"
       if (a.get('waiting_time').getTime() > b.get('waiting_time').getTime())
         return 1
       if (a.get('waiting_time').getTime() < b.get('waiting_time').getTime())
         return -1
       return 0
     @set('waitingList', waitingList)
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
