App.ChallengeController = Ember.ArrayController.extend
  needs: ['person']
  declineChallenge: (challenge) ->
    
    awayPerson = challenge.get('away')
    awayPerson.get('challenges').removeObject challenge
    awayPerson.save()

    homePerson = challenge.get('home')
    homePerson.get('challenges').removeObject challenge
    homePerson.save()

    challenge.delete()

  createChallenge: (homePerson, awayPerson) ->
    challenge = @get('store').createRecord('challenge',
      home: homePerson
      away: awayPerson
      created_at: new Date()
    )
    awayPerson.get('challenges').addObject challenge
    homePerson.get('challenges').addObject challenge
    challenge.save()
    awayPerson.save()
    homePerson.save()
    #Commented out for now...
    # challengeRequest = @store.createRecord("challengeRequest",
    #   home: home.get('twitter')
    #   away: away.get('twitter')
    # )
