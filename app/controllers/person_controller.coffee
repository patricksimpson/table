App.PersonController = Ember.ObjectController.extend
  wins:( ->
    #@get('name')
   1
  ).property('games')
  needs: ['auth','challenge']
  authedPerson: Ember.computed.alias('controllers.auth.person')
  iAmSure: false
  isEditing: false
  isAuthAdmin: Ember.computed.alias('controllers.auth.isAdmin')
  isChallenged: false
  isMe: (->
    @get('controllers.challenge').canChallenge(@get('authedPerson'), @get('model'))
    return @get('id') == @get('authedPerson.id')
  ).property('content', 'authedPerson')
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
      person = @get('model')
      person.setProperties(
        is_waiting: true
      )
      person.save()
    leaveWaitingList: ->
      person = @get('model')
      person.setProperties(
        is_waiting: false
      )
      person.save()
    challengeRequest: ->
      @get('controllers.challenge').addChallenge(@get('authedPerson'), @get('model'))
      @set('isChallenged', true)
