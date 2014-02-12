App.UsersRoute = Ember.Route.extend(
  model: ->
    return @store.find('person')
)
