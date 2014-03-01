
module.exports = App.CompletedGamesController = Ember.ArrayController.extend
  needs: ['game']
  games: (->
    @get('content').map((game) ->
      hs = game.get('homeScore')
      as = game.get('awayScore')
      game.set('homeWinner', hs > as)
      game.set('awayWinner', as > hs)
      completed = game.get('completedAt')
      console.log moment(completed).fromNow()
      game.set('date', moment(completed).fromNow())
      game
    ).reverse()
  ).property('content.@each')
