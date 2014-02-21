App.PersonController = Ember.ObjectController.extend
  wins:( ->
    #@get('name')
   1
  ).property('games')
  needs: ['auth','wait']
  iAmSure: false
  isEditing: false
  isLoggedIn: false
  isWaiting: false
  loggedIn: (->
    if @loggedIn
      @set('isMe', @get('id') == @get('controllers.auth.userId'))
    else
      @set('isMe', false)
    @get('controllers.wait').isWait(@get('model'))
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
    editPerson: ->
      @set('isEditing', true)
    doEditPerson: ->
      console.log "save"
    cancelEditPerson: ->
      @set('isEditing', false)
    joinWaitingList: ->
      @get('controllers.wait').addPerson(@get('model'))
      @set('isWaiting', true)
    leaveWaitingList: ->
      @get('controllers.wait').removePerson(@get('model'))
      @set('isWaiting', false)
