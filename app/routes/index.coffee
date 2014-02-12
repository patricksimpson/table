module.exports = App.IndexRoute = Ember.Route.extend
  model: ->
    EmberFire.Object.create({
        ref: new Firebase "https://glaring-fire-8110.firebaseio.com/"
      }
    )
