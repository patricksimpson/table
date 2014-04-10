App.RecordController = Ember.ObjectController.extend
  needs: ['person', 'people', 'auth', 'application', 'game']
  homePersonSelect: null
  awayPersonSelect: null
  gameOneHome: null
  gameOneAway: null
  gameTwoHome: null
  gameTwoAway: null
  gameThreeHome: null
  gameThreeAway: null
  error: null
  authPerson: Ember.computed.alias('controllers.auth.person')
  game: Ember.computed.alias('controllers.game')
  people: []
  getPeople: (->
    people = []
    @set('people', people)
    @get('store').fetch('person').then (peopleList) =>
      people = peopleList.map (person) =>
       person
      
      people.unshift(
        id: 0
        name: "--Select--"
      )
      @set('people', people)
    return ""
  ).property('getPeople')
  actions:
    recordNewGame: ->
      @set('error', null)
      homePerson = @get('authPerson')
      awayPerson = @get('awayPersonSelect')
      h = []
      a = []
      h.push(@get('gameOneHome')*1)
      a.push(@get('gameOneAway')*1)
      h.push(@get('gameTwoHome')*1)
      a.push(@get('gameTwoAway')*1)
      h.push(@get('gameThreeHome')*1)
      a.push(@get('gameThreeAway')*1)
      
      if homePerson != null && awayPerson != null
        if homePerson.get('id') != awayPerson.get('id')
          # game = @get('game').createGame(homePerson, awayPerson)
          if h[0] != null and
              a[0] != null and
              h[1] != null and
              a[1] != null and
              h[0] > 0 and
              a[0] > 0 and
              h[1] > 0 and
              a[1] > 0
            if h[0] == a[0]
              @set('error', 'Game 1: Scores cannot be equal')
              return
            if h[1] == a[1]
              @set('error', 'Game 2: Scores cannot be equal')
              return
            if (h[0]+1) == a[0] or h[0] == (a[0]+1)
              @set('error', 'Game 1: Must win by 2')
              return
            if (h[1]+1) == a[1] or h[1] == (a[1]+1)
              @set('error', 'Game 2: Must win by 2')
              return

            console.log "all set!"
          else
            @set('error', 'Please set game values!')
        else
          @set('error', "Sorry, you can't play yourself doofus.")
          console.log "Cannot be the same person"
      return
    
