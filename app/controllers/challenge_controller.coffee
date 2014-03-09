App.ChallengeController = Ember.ArrayController.extend
  needs: ['game', 'auth']
  authPerson: Ember.computed.alias('controllers.auth.person')
  game: Ember.computed.alias('controllers.game')
  declineChallenge: (challenge) ->
    
    awayPerson = challenge.get('away')
    awayPerson.get('challenges').removeObject challenge
    awayPerson.save()

    challenge.setProperties
      declined: true

    challenge.save()

    homePerson = challenge.get('home')
    homePerson.get('responses').addObject challenge
    homePerson.save()
  removeResponse: (challenge) ->
    if challenge?
      homePerson = challenge.get('home')
      if homePerson == null
       if @get('authPerson') != null
         homePerson = @get('authPerson')
       else
        console.log "Failed Object Host"
        return
      homePerson.get('responses').removeObject challenge
      homePerson.save()
      challenge.delete()
    else
      console.log challenge
  removeChallenge: (challenge) ->
    awayPerson = challenge.get('away')
    if awayPerson == null
      if @get('authPerson') != null
        awayPerson = @get('authPerson')
      else
        console.log "Failed Object Host"
        return
    awayPerson.get('challenges').removeObject challenge
    awayPerson.save()

    Ember.run.later(challenge, =>
      challenge.delete()
    , 500)
  createChallenge: (homePerson, awayPerson) ->
    challenge = @get('store').createRecord('challenge',
      home: homePerson
      away: awayPerson
      createdAt: new Date()
    )
    challenge.save().then (challenge) =>
      awayPerson.get('challenges').addObject challenge
      awayPerson.save()
    challengeRequest = @store.createRecord("challengeRequest",
      home: homePerson.get('twitter')
      away: awayPerson.get('twitter')
    )
    challengeRequest.save()

  acceptChallenge: (challenge) ->
    home = challenge.get('home')
    away = challenge.get('away')
    game = @get('game')
    
    away.get('challenges').removeObject challenge
    away.save()
    
    challenge.delete()

    game.addGame(home, away)
