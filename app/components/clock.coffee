ONE_SECOND = 1000
module.exports = App.Clock = Ember.Object.extend(
  second: null
  minute: null
  hour: null
  init: ->
    @tick()
    return

  tick: ->
    now = new Date()
    @setProperties
      second: now.getSeconds()
      minute: now.getMinutes()
      hour: now.getHours()

    self = this
    setTimeout (->
      self.tick()
      return
    ), ONE_SECOND
    return
)
