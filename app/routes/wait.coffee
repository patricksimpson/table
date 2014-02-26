module.exports = App.WaitRoute = Ember.Route.extend
  mode: ->
    @store.fetch('waits')
  renderTemplate: ->
    @render({outlet: waits})
