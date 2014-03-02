clock = require 'components/clock'

module.exports = Ember.Application.initializer
  name: 'clock'
  initialize: (container, application) ->
    application.register(
      'clock:main', clock, instantiate: true, singleton: true
    )
    application.inject('controller', 'clock', 'clock:main')
