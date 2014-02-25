App.PersonController = Ember.ObjectController.extend
  wins:( ->
    #@get('name')
   1
  ).property('games')
  needs: ['auth','challenge']
  challenge: Ember.computed.alias('controllers.challenge.content')
  authedPerson: Ember.computed.alias('controllers.auth.person')
  isAuthAdmin: Ember.computed.alias('controllers.auth.isAdmin')
  iAmSure: false
  isEditing: false
  challengeDeclined: (->
    changed = false
    debugger
    for challenge in @get('responses')
      if challenge.get('declined')
        @get('challenges').removeObject challenge
        changed = true
    if changed
      @.save()
  ).property('content','challenge')
  isMe: (->
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
      @get('controllers.challenge').createChallenge(@get('authedPerson'), @get('model'))

