module.exports = App.ApplicationRoute = Ember.Route.extend
  model: ->
    Ember.RSVP.all [
      @get('store').fetch('person')
      @get('store').fetch('wait')
      @get('store').fetch('currentGame')
      @get('store').fetch('pendingGame')
      @get('store').fetch('challenge')
    ]
    
  setupController: (controller, model) ->
    controller.set('people', model[0] )
    controller.set('waits', model[1])
    controller.set('currentGame', model[2])
    controller.set('pendingGameData', model[3])
    controller.set('challengeData', model[4])
  actions:
    goToLink: (item, anchor) ->
      $elem = $(anchor)
      $scrollTo = $('body').scrollTop($elem.offset().top)
      @transitionTo(item.route).then($scrollTo)
