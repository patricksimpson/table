App.PersonController = Ember.ObjectController.extend
  wins:( ->
    #@get('name')
   1
  ).property('games')
  needs: ['auth','challenge', 'wait']
  challenge: Ember.computed.alias('controllers.challenge')
  authedPerson: Ember.computed.alias('controllers.auth.person')
  isAuthAdmin: Ember.computed.alias('controllers.auth.isAdmin')
  wait: Ember.computed.alias('controllers.wait')
  iAmSure: false
  isEditing: false
  isChallenged: (->
    person = @get('model')
    challenges = person.get('challenges')
    for challenge in challenges.toArray()
      request = challenge.content
      if request == undefined
        request = challenge
      if request == undefined
        return
      away_id = request.get('away.id')
      person_id = person.get('id')
      if person_id == away_id
        return true
    return false
  ).property('content', 'authedPerson.content.challenges.@each', 'challenges.content.@each')
  challengeDeclined: (->
    changed = false
    for challenge in @get('responses')
      if challenge.get('declined')
        @get('challenges').removeObject challenge
        changed = true
    if changed
      @.save()
  ).property('content')
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
      console.log "savin"
    cancelEditPerson: ->
      @set('isEditing', false)
    joinWaitingList: ->
      person = @get('model')
      if person.get('is_waiting')
        return
      person.setProperties(
        is_waiting: true
        waiting_time: new Date()
      )
      person.save()
      @get('wait').addPerson(person)
    leaveWaitingList: ->
      person = @get('model')
      person.setProperties(
        is_waiting: false
        waiting_time: null
      )
      person.save()
      @get('wait').removePerson(person)
    challengeRequest: ->
      @get('controllers.challenge').createChallenge(@get('authedPerson'), @get('model'))

