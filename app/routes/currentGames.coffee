module.exports = App.CurrentGameRoute = Ember.Route.extend
  model: (params) ->
    # @store.fetch('currentGame', params.currentGame_id)
    new Ember.RSVP.Promise (resolve, reject) =>
      @store.fetch('currentGame', limit: 1).then (currentGames) ->
        resolve currentGames.get('firstObject')
