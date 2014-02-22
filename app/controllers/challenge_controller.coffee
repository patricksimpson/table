App.ChallengeController = Ember.ArrayController.extend
  needs: ['person']
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
    challengeRequest.save()
