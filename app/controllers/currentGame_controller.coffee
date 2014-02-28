App.CurrentGameController = Ember.ObjectController.extend
  needs: ['person', 'people']
  home_score: 0
  away_score: 0
  currentRound: 0
  actions:
    addPointHome: ->
      game = @get('model')
      #Get rounds, and current round.
      rounds = game.get('rounds')
      @set('currentRound', rounds.length - 1)
      round = rounds[@get('currentRound')]
      #Add pointz
      score = round.home_score
      score = score + 1
      #create new round object 
      updated_rounds =
        home_score: score
        away_score: round.away_score

      #set the round object, and save.
      rounds[@get('currentRound')] = updated_rounds
      game.set('rounds', rounds.toArray())
      game.save()
    subtractPointHome: ->
      game = @get('model')
      #Get rounds, and current round
      rounds = game.get('rounds')
      @set('currentRound', rounds.length - 1)
      round = rounds[@get('currentRound')]
      #Subtract score 
      score = round.home_score
      round = rounds[rounds.length - 1]
      score = score - 1
      if score < 0
        return
      #create new round object
      updated_rounds =
        home_score: score
        away_score: round.away_score

      #set the round object and save
      rounds[@get('currentRound')] = updated_rounds
      game.set('rounds', rounds.toArray())
      game.save()
    addPointAway: ->
      game = @get('model')
      #Get rounds, and current round
      rounds = game.get('rounds')
      @set('currentRound', rounds.length - 1)
      round = rounds[@get('currentRound')]
      #Add points
      score = round.away_score
      score = score + 1
      #create new round object
      updated_rounds =
        home_score: round.home_score
        away_score: score

      #set the round obect and save.
      rounds[@get('currentRound')] = updated_rounds
      game.set('rounds', rounds.toArray())
      game.save()
    subtractPointAway: ->
      game = @get('model')
      #Get rounds, and current round
      rounds = game.get('rounds')
      @set('currentRound', rounds.length - 1)
      round = rounds[@get('currentRound')]
      #Subtract points
      score = round.away_score
      score = score - 1
      if score < 0
        return
      #create new round object
      updated_rounds =
        home_score: round.home_score
        away_score: score

      #set the round obect and save.
      rounds[@get('currentRound')] = updated_rounds
      game.set('rounds', rounds.toArray())
      game.save()
