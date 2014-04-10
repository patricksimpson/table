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
  pendingRounds: []
  pendingHomeScore: 0
  pendingAwayScore: 0
  pendingHomePerson: null
  pendingAwayPerson: null
  error: null
  authPerson: Ember.computed.alias('controllers.auth.person')
  game: Ember.computed.alias('controllers.game')
  mustConfirm: false
  confirm: null
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
      @set('mustConfirm', false)
      homePerson = @get('authPerson')
      awayPerson = @get('awayPersonSelect')
      @set('pendingHomePerson', homePerson)
      @set('pendingAwayPerson', awayPerson)
      awayName = awayPerson.get('name')
      h = []
      a = []
      h.push(@get('gameOneHome')*1)
      a.push(@get('gameOneAway')*1)
      h.push(@get('gameTwoHome')*1)
      a.push(@get('gameTwoAway')*1)
      h.push(@get('gameThreeHome')*1)
      a.push(@get('gameThreeAway')*1)
      homeScore = 0
      awayScore = 0
      thirdPlayed = false
      rounds = []
      if homePerson != null && awayPerson != null
        if homePerson.get('id') != awayPerson.get('id')
          # game = @get('game').createGame(homePerson, awayPerson)
          if h[0] == a[0]
            @set('error', 'Game 1: Score cannot be equal')
            return
          if h[1] == a[1]
            @set('error', 'Game 2: Score cannot be equal')
            return
          if (h[0]+1) == a[0] or h[0] == (a[0]+1)
            @set('error', 'Game 1: Must win by 2')
            return
          if (h[1]+1) == a[1] or h[1] == (a[1]+1)
            @set('error', 'Game 2: Must win by 2')
            return
          if h[2] != 0 or a[2] != 0
            thirdPlayed = true
            if h[2] == a[2]
              @set('error', 'Game 3: Score cannot be equal')
              return
            if (h[2]+1) == a[2] or h[2] == (a[2]+1)
              @set('error', 'Game 3: Must win by 2')
              return
            
          if h[0] > a[0]
            homeScore++
          else
            awayScore++
          rounds.push(
            index: 2
            homeScore: h[0]
            awayScore: a[0]
            isComplete: true
          )
          if h[1] > a[1]
            homeScore++
          else
            awayScore++
          rounds.push(
            index: 2
            homeScore: h[1]
            awayScore: a[1]
            isComplete: true
          )
          if thirdPlayed
            if h[2] > a[2]
              homeScore++
            else
              awayScore++
            rounds.push(
              index: 3
              homeScore: h[2]
              awayScore: a[2]
              isComplete: true
            )
          if homeScore == awayScore
            @set('error', 'Cannot tie the match, enter 3rd game.')
            return
          # Create game, and save it to completed.
          @set('mustConfirm', true)
          if homeScore > awayScore
            @set('confirm', "You beat " + awayName + " " + homeScore + " to " + awayScore)
          else
            @set('confirm', awayName + " beat you " + homeScore + " to " + awayScore)
          @set('pendingRounds', rounds)
          @set('pendingHomeScore', homeScore)
          @set('pendingAwayScore', awayScore)
          setTimeout( ->
            $("#confirmGame").focus()
          , 200)
          return
        else
          @set('error', 'Please set game values!')
      else
        @set('error', "You can't play yourself... doofus.")
        return
      return
    clearConfirm: ->
      @set('confirm', null)
      @set('mustConfirm', false)
    confirmGame: ->
      rounds = @get('pendingRounds')
      homeScore = @get('pendingHomeScore')
      awayScore = @get('pendingAwayScore')
      homePerson = @get('pendingHomePerson')
      console.log homePerson
      awayPerson = @get('pendingAwayPerson')
      completedGame = @get('store').createRecord('completedGame',
      home: homePerson
      away: awayPerson
      createdAt: new Date()
      startedAt: new Date()
      completedAt: new Date()
      homeScore: homeScore
      awayScore: awayScore
      rounds: rounds
      )
      completedGame.save()
      @transitionToRoute("completedGames")
    cancelConfirm: ->
      @set('confirm', null)
      @set('mustConfirm', false)

