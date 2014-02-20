App.PersonController = Ember.ObjectController.extend
  wins:( ->
    #@get('name')
    1
  ).property('games')
  needs: ['auth']
  iAmSure: false
  isLoggedIn: false
  loggedIn: (->
    if @loggedIn
      @set('isMe', @get('id') == @get('controllers.auth.userId'))
    else
      @set('isMe', false)
  ).observes('isLoggedIn')
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