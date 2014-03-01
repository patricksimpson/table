App.CurrentGameController = Ember.ObjectController.extend
  needs: ['person', 'people']
  currentRound: 0
  roundsWithIndex: ( ->
    @get('rounds').map((round, index) =>
      round: round
      index: index + 1
    ).reverse()
  ).property('rounds')
  actions:
    addPointHome: ->
      game = @get('model')
      #Get rounds, and current round.
      rounds = game.get('rounds')
      @set('currentRound', rounds.length - 1)
      round = rounds[@get('currentRound')]
      #Add pointz
      score = round.homeScore
      score = score + 1
      #create new round object 
      updatedRounds =
        homeScore: score
        awayScore: round.awayScore

      #set the round object, and save.
      rounds[@get('currentRound')] = updatedRounds
      game.set('rounds', rounds.toArray())
      game.save()
    subtractPointHome: ->
      game = @get('model')
      #Get rounds, and current round
      rounds = game.get('rounds')
      @set('currentRound', rounds.length - 1)
      round = rounds[@get('currentRound')]
      #Subtract score 
      score = round.homeScore
      round = rounds[rounds.length - 1]
      score = score - 1
      if score < 0
        return
      #create new round object
      updatedRounds =
        homeScore: score
        awayScore: round.awayScore

      #set the round object and save
      rounds[@get('currentRound')] = updatedRounds
      game.set('rounds', rounds.toArray())
      game.save()
    addPointAway: ->
      game = @get('model')
      #Get rounds, and current round
      rounds = game.get('rounds')
      @set('currentRound', rounds.length - 1)
      round = rounds[@get('currentRound')]
      #Add points
      score = round.awayScore
      score = score + 1
      #create new round object
      updatedRounds =
        homeScore: round.homeScore
        awayScore: score

      #set the round obect and save.
      rounds[@get('currentRound')] = updatedRounds
      game.set('rounds', rounds.toArray())
      game.save()
    subtractPointAway: ->
      game = @get('model')
      #Get rounds, and current round
      rounds = game.get('rounds')
      @set('currentRound', rounds.length - 1)
      round = rounds[@get('currentRound')]
      #Subtract points
      score = round.awayScore
      score = score - 1
      if score < 0
        return
      #create new round object
      updatedRounds =
        homeScore: round.homeScore
        awayScore: score

      #set the round obect and save.
      rounds[@get('currentRound')] = updatedRounds
      game.set('rounds', rounds.toArray())
      game.save()

    endRound: (round) ->
      game = @get('model')
      debugger
      if round.homeScore + 1 > round.awayScore
        score = game.get('homeScore')
        score = score + 1
        game.set('homeScore', score)
        rounds = game.get('rounds').toArray()
        new_round =
          homeScore: 0
          awayScore: 0
        rounds.push(new_round)
        game.set('rounds', rounds)
        game.save()
        return
      if round.awayScore + 1 > round.homeScore
        score = game.get('awayScore')
        score = score + 1
        game.set('awayScore', score)
        rounds = game.get('rounds').toArray()
        new_round =
          homeScore: 0
          awayScore: 0
        rounds.push(new_round)
        game.set('rounds', rounds)
        game.save()
        return
      console.log "Must win by 2, cannot be a tie/draw"
      return false
