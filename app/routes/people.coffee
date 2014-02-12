App.PeopleRoute = Ember.Route.extend(
  model: ->
    return @store.find('person')
)
