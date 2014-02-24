module.exports = App.PeopleController = Ember.ArrayController.extend
  needs: ['auth', 'challenge']
  person: Ember.computed.alias('controllers.auth.person')
  challenges: Ember.computed.alias('controllers.challenge.challenges')
  errors: []
  personName: null
  personEmail: null
  people: (->
    @set('isWaiting', false)
    currentPerson = @get('person')
    if currentPerson?
      challenges = currentPerson.get("challenges")
      for challengeRequests in challenges.toArray()
        challenge = challengeRequests.content
        homePerson = challenge.get("home")
        awayPerson = challenge.get("away")
        console.log homePerson.get("name")
        console.log awayPerson.get("name")
    @get('content').map (person) =>
      isMe = ( person.get('id') == currentPerson?.get('id') )
      person.set('isMe', isMe)
      person
  ).property('content.@each', 'person')
  isChallenged: (person) ->
    challenges = @get('challenges')
    challenges.map (challenge) =>
      if challenge.get('away.id') == person.get('id')
        person.set('challengedBy', challenge.get('home'))
        person.set('isChallenged', true)
        @set('person', person)
  actions:
    addPerson: ->
      personName = @get('personName')
      personEmail = @get('personEmail')
      errors = @get('errors')
      errors = []
      if personName == undefined or personName == "" or personName == null
        errors.push "Person name empty."
      if personEmail == undefined or personEmail == "" or personEmail== null
        errors.push "Person email empty."
      if errors.length < 1
        person = @store.createRecord("person",
          name: personName
          email: personEmail
        )
        person.save()
        @set('isAdding', false)
        @set('personName', null)
        @set('personEmail', null)
      else
        @set('errors', errors)

    showAddPerson: ->
      @set('isAdding', true)
    cancelAddPerson: ->
      @set('isAdding', false)
      @set('errors', [])
      @set('personName', null)
      @set('personEmail', null)
      
  isAdding: false
