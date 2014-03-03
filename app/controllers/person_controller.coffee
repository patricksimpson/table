App.PersonController = Ember.ObjectController.extend
  needs: ['auth','challenge', 'wait']
  challengeData: Ember.computed.alias('controllers.challenge')
  authedPerson: Ember.computed.alias('controllers.auth.person')
  isAuthAdmin: Ember.computed.alias('controllers.auth.isAdmin')
  wait: Ember.computed.alias('controllers.wait')
  iAmSure: false
  isEditing: false
  isChallenged: false
  hasChallenges: (->
    person = @get('model')
    authedPerson = @get('authedPerson')
    challenges = person.get('challenges')
    @set('isChallenged', false)
    for challenge in challenges.content
      id = challenge.id
      @get('store').fetch('challenge', id).then ((myChallenge) =>
        if !@get('isChallenged')
          authedPerson = @get('authedPerson')
          if !authedPerson?
            return
          if (myChallenge.get('home').get('id') == authedPerson.get('id')) and (myChallenge.get('away').get('id') == person.get('id'))
            @set('isChallenged', true)
          else
            @set('isChallenged', false)
        )
    return ""
  ).property('content.challenges.@each', 'controllers.challenge.content.@each', 'authedPerson')
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
      if person.get('isWaiting')
        return
      person.setProperties(
        isWaiting: true
        waiting_time: new Date()
      )
      person.save()
      @get('wait').addPerson(person)
    leaveWaitingList: ->
      person = @get('model')
      person.setProperties(
        isWaiting: false
        waiting_time: null
      )
      person.save()
      @get('wait').removePerson(person)
    challengeRequest: ->
      @get('controllers.challenge').createChallenge(@get('authedPerson'), @get('model'))

