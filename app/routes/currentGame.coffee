module.exports = App.CurrentGameRoute = Ember.Route.extend
  model: (params) ->
    @store.fetch('currentGame', params.currentGame_id)
