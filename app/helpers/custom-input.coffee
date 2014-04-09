customInput = Ember.TextField.extend(keyUp: (event) ->
    @sendAction "key-up", this, event
    return
)
Ember.Handlebars.helper "custom-input", customInput

