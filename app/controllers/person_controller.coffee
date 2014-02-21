App.PersonController = Ember.ObjectController.extend
  wins:( ->
    #@get('name')
   1
  ).property('games')
  needs: ['auth','wait']
  authedPerson: Ember.computed.alias('controllers.auth.person')
  iAmSure: false
  isEditing: false
  isWaiting: (->
    @get('controllers.wait').isWait(@get('model'))
  ).property('authedPerson')
  isMe: (->
    @get('id') == @get('authedPerson.id')
  ).property('authedPerson')
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
