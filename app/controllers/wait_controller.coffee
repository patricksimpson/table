App.WaitController = Ember.ArrayController.extend
  needs: ['person', 'auth']
  addPerson: (appendPerson) ->
    newWait = @get('store').createRecord("wait",
      person: appendPerson
      created_at: new Date()
    )
    newWait.save()
  removePerson: (person) ->
    @get('store').fetch('wait').then ((wait) =>
      for n in wait.content
        if n.get('person').get('id') == person.get('id')
          n.delete()
          return true
      return false
    )
