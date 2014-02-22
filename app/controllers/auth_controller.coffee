App.AuthController = Ember.Controller.extend
  needs: ['people', 'person']
  isAuthed: false
  userId: 0
  setupAuth:( ->
    slRef = new Firebase('https://glaring-fire-8110.firebaseio.com')
    console.log("run")
    @authClient = new FirebaseSimpleLogin(slRef, (err, user) =>
      if !err && user
        @pickUser(user)
    )
  ).on('init')
  pickUser: (user) ->
    console.log user
    @get('store').fetch('person', user.id).then ((person) =>
      person.setProperties(
        name: user.name
        twitter: user.username
      )
      person.save()
      @set('person', person)
    ), (error) =>
      newPerson = @get('store').createRecord("person",
        id: user.id
        name: user.name
        twitter: user.username
        email: ''
        is_admin: false
        created_at: new Date()
      )
      newPerson.save().then =>
        @set('person', person)

  login: ->
    @authClient.login('twitter', { rememberMe: true } )
    
  logout: ->
    @authClient.logout()
    @set('person', undefined)
