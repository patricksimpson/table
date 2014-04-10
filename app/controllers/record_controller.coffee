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
  pendingHome: []
  pendingAway: []
  pendingHomeScore: 0
  pendingAwayScore: 0
  pendingPerson: null
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
      
      if homePerson != null && awayPerson != null
        if homePerson.get('id') != awayPerson.get('id')
          # game = @get('game').createGame(homePerson, awayPerson)
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
          if h[2] != 0 or a[2] != 0
            thirdPlayed = true
            if h[2] == a[2]
              @set('error', 'Game 3: Scores cannot be equal')
              return
            if (h[2]+1) == a[2] or h[2] == (a[2]+1)
              @set('error', 'Game 3: Must win by 2')
              return
            
          if h[0] > a[0]
            homeScore++
          else
            awayScore++
          if h[1] > a[1]
            homeScore++
          else
            awayScore++
          if thirdPlayed
            if h[2] > a[2]
              homeScore++
            else
              awayScore++
          if homeScore == awayScore
            @set('error', 'Cannot tie the match, enter 3rd game.')
            return
          # Create game, and save it to completed.
          @set('mustConfirm', true)
          if homeScore > awayScore
            @set('confirm', "You beat " + awayName + " " + homeScore + " to " + awayScore)
          else
            @set('confirm', awayName + " beat you " + homeScore + " to " + awayScore)
          @set('pendingHome', h)
          @set('pendingAway', a)
          @set('pendingHomeScore', homeScore)
          @set('pendingAwayScore', awayScore)
          @set('pendingPerson', awayPerson)
          setTimeout( ->
            console.log "focus!"
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

    cancelConfirm: ->
      @set('confirm', null)
      @set('mustConfirm', false)

