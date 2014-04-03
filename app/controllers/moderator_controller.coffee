App.ModeratorController = Ember.ObjectController.extend
  needs: ['person', 'people', 'auth', 'application', 'game']
  homePersonSelect: null
  awayPersonSelect: null
  authPerson: Ember.computed.alias('controllers.auth.person')
  game: Ember.computed.alias('controllers.game')
  people: []
  getPeople: (->
    people = []
    @set('people', people)
    @get('store').fetch('person').then (peopleList) =>
      people = peopleList.map (person) =>
       person
      @set('people', people)
    return ""
  ).property('getPeople')
  actions:
    createNewGame: ->
      homePerson = @get('homePersonSelect')
      awayPerson = @get('awayPersonSelect')
      if homePerson != awayPerson
        game = @get('game').createGame(homePerson, awayPerson)
      else
        console.log "Cannot be the same person"
      return
    
