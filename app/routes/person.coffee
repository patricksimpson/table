module.exports = App.PersonRoute = Ember.Route.extend
  model: (params) ->
    @store.fetch('person', params.person_id)
