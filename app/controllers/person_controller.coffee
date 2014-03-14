App.PersonController = Ember.ObjectController.extend
  needs: ['auth','challenge', 'wait', 'game', 'completedGames']
  challengeData: Ember.computed.alias('controllers.challenge')
  authedPerson: Ember.computed.alias('controllers.auth.person')
  isAuthAdmin: Ember.computed.alias('controllers.auth.isAdmin')
  wait: Ember.computed.alias('controllers.wait')
  iAmSure: false
  isEditing: false
  isChallenged: false
  games: []
  lastStatus: ""
  lastPlayed: "Never"
  completedGames: ( ->
    @set('games', [])
    person = @get('model')
    recountWins = 0
    recountLosses = 0
    @get('store').fetch('completedGame').then ((games) =>
      person = @get('model')
      gameHistory = games.filter (game) =>
        game.get('home').get('id') == person.get('id') or
        game.get('away').get('id') == person.get('id')
      totalGames = gameHistory.map((game) ->
        hs = game.get('homeScore')
        as = game.get('awayScore')
        game.set('homeWinner', hs > as)
        game.set('awayWinner', as > hs)
        status = "Lost"
        isHome = false
        isAway= false
        won = false
        if game.get('home').get('id') == person.get('id')
          isHome = true
        if game.get('away').get('id') == person.get('id')
          isAway = true
        if (isHome) and (game.get('homeWinner'))
          status = "Won"
          won = true
        if (isAway) and (game.get('awayWinner'))
          status = "Won"
          won = true
        game.won = won
        if game.won
          recountWins++
        else
         recountLosses++

        game.isHome = isHome
        game.isAway = isAway
        completed = game.get('completedAt')
        game.set('date', moment(completed).fromNow())
        game.status = status
        game
      ).reverse()
      if totalGames.length > 0
        status = totalGames[0].status
        last = totalGames[0].get('date')
      else
        last = "Never"
      
      @set('lastStatus', status)
      @set('lastPlayed', last)
      @set('games', totalGames)

      wins = @get('wins')
      losses = @get('losses')
      if recountWins != wins or recountLosses != losses
        person = @get('model')
        person.set('wins', recountWins)
        person.set('losses', recountLosses)
        person.save()
    )
    ""
  ).property('content', 'controllers.completedGames.games.@each')
  hasChallenges: ( ->
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

