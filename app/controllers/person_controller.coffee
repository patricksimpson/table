App.PersonController = Ember.ObjectController.extend(Ember.Evented, {
  wins:( ->
    #@get('name')
    1
  ).property('games')
  needs: ['auth']
  loggedIn: false
  iAmSure: false
  isLoggedIn: (->
    if @loggedIn
      @set('isMe', @get('id') == @get('controllers.auth.authId'))
    else
      @set('isMe', false)
  ).observes('loggedIn')
  actions:
    deleteMe: ->
      yousure = @get('iAmSure')
      if !yousure
        alert("Are you sure?")
      else
        person = @get('model')
        person.delete()
        @set('iAmSure', false)
        @transitionTo('/')
})
