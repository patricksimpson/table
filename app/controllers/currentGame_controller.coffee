App.CurrentGameController = Ember.ObjectController.extend
  needs: ['person', 'people']
  home_score: 0
  away_score: 0
  actions:
    addPointHome: ->
      game = @get('model')
      rounds = game.get('rounds')
      round = rounds[rounds.length - 1]
      score = round.home_score
      score = score + 1
      updated_rounds = [
        {
          home_score: score
          away_score: round.away_score
        }
      ]
      game.set('rounds', updated_rounds)
      game.save()
    subtractPointHome: ->
      game = @get('model')
      rounds = game.get('rounds')
      round = rounds[rounds.length - 1]
      score = round.home_score
      score = score - 1
      updated_rounds = [
        {
          home_score: score
          away_score: round.away_score
        }
      ]
      game.set('rounds', updated_rounds)
      game.save()
    addPointAway: ->
      game = @get('model')
      rounds = game.get('rounds')
      round = rounds[rounds.length - 1]
      score = round.away_score
      score = score + 1
      updated_rounds = [
        {
          home_score: round.home_score
          away_score: score
        }
      ]
      game.set('rounds', updated_rounds)
      game.save()
    subtractPointAway: ->
      game = @get('model')
      rounds = game.get('rounds')
      round = rounds[rounds.length - 1]
      score = round.away_score
      score = score - 1
      updated_rounds = [
        {
          home_score: round.home_score
          away_score: score
        }
      ]
      game.set('rounds', updated_rounds)
      game.save()

