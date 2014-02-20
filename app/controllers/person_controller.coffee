App.PersonController = Ember.ObjectController.extend(Ember.Evented, {
  wins:( ->
    #@get('name')
    1
  ).property('games')
  needs: ['auth']
  loggedIn: false
  iAmSure: false
  isLoggedIn: (->
    console.log "checking for who you are.."
    if @loggedIn
      console.log "you are logged in"
      @set('isMe', @get('id') == @get('controllers.auth.authId'))
    else
      console.log "you are not logged in"
      @set('isMe', false)
  ).observes('loggedIn')
  actions:
    deleteMe: ->
      yousure = @get('iAmSure')
      if !yousure
        alert("Go if you must... but you must be sure.")
      else
        person = @get('model')
        person.delete()
        @set('iAmSure', false)
        @transitionTo('/')
})
