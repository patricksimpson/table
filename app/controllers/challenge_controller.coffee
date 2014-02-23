App.ChallengeController = Ember.ArrayController.extend
  needs: ['person']
  challenges: []
  startup: (->
    @get('setChallenged')
  ).on('init')
  setChallenged: (->
    @set('challenges', [])
    @get('store').fetch('challenge').then ((challenges) =>
      @set('challenges', challenges)
    )
  ).property('content')
  addChallenge: (home, away) ->
    if home.get('id') == away.get('id')
      console.log "you cannot do that!"
      return
    @get('store').fetch('challenge').then ((challenges) =>
      if challenges.content.length > 0
        for challenge in challenges.content
          homePerson = challenge.get('home')
          awayPerson = challenge.get('away')
          if home.get('id') != homePerson.get('id') && away.get('id') != awayPerson.get('id')
            @createChallenge(home, away)
          else
            console.log "already challenged!"
      else
        @createChallenge(home, away)
    ), (error) =>
      @createChallenge(home, away)
  canChallenge: (home, away) ->
    if home == undefined or away == undefined
      return
    @get('store').fetch('challenge').then ((challenges) =>
      if challenges.content.length > 0
        for challenge in challenges.content
          homePerson = challenge.get('home')
          awayPerson = challenge.get('away')
          if away.get('id') != awayPerson.get('id') || home.get('id') != homePerson.get('id')
            @set('controllers.person.isChallenged', false)
          else
            @set('controllers.person.isChallenged', true)
            return
      else
        @set('controllers.person.isChallenged', false)
    ), (error) =>
      console.log error
      @set('controllers.person.isChallenged', false)

  createChallenge: (home, away) ->
    newChallenge = @store.createRecord("challenge",
      home: home
      away: away
      created_at: new Date()
    )
    newChallenge.save()
    challengeRequest = @store.createRecord("challengeRequest",
      home: home.get('twitter')
      away: away.get('twitter')
    )
