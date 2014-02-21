App.AuthController = Ember.Controller.extend
  needs: ['people', 'person']
  isAuthed: false
  userId: 0
  setupAuth:( ->
    slRef = new Firebase('https://glaring-fire-8110.firebaseio.com')
    @authClient = new FirebaseSimpleLogin(slRef, (err, user) =>
      if !err && user
        @pickUser(user)
    )
  ).on('init')
  pickUser: (user) ->
    @set('user', user)
    @set('userId', user.id)
    @get('store').fetch('person', user.id).then ((person) =>
      person.setProperties(
        name: user.name
        twitter: user.username
      )
      person.save()
      @set('person', person)
      @set('isAuthed', true)
      @set('controllers.person.isLoggedIn', true)
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
      @set('isAuthed', true)
      @set('controllers.person.isLoggedIn', true)

  login: ->
    @authClient.login('twitter', { rememberMe: true } )
    
  logout: ->
    @authClient.logout()
    @set('isAuthed', false)
    @set('controllers.person.isLoggedIn', false)
    @set('person', undefined)
    @set('userId', 0)
