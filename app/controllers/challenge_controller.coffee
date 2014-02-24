App.ChallengeController = Ember.ArrayController.extend
  needs: ['person']
  declineChallenge: (challenge) ->
    
    awayPerson = challenge.get('away')
    awayPerson.get('challenges_away').removeObject challenge
    awayPerson.save()

    homePerson = challenge.get('home')
    homePerson.get('challenges_home').removeObject challenge
    homePerson.save()

    challenge.delete()

  createChallenge: (homePerson, awayPerson) ->
    challenge = @get('store').createRecord('challenge',
      home: homePerson
      away: awayPerson
      created_at: new Date()
    )
    awayPerson.get('challenges_away').addObject challenge
    homePerson.get('challenges_home').addObject challenge
    challenge.save()
    awayPerson.save()
    homePerson.save()
    #Commented out for now...
    # challengeRequest = @store.createRecord("challengeRequest",
    #   home: home.get('twitter')
    #   away: away.get('twitter')
    # )
