App.ApplicationAdapter = DS.FixtureAdapter
App.Person = DS.Model.extend(
  name: DS.attr()
  email: DS.attr()
)

App.Person.FIXTURES = [
  {
    id: 1
    name: 'Patrick Simpson'
    email: 'izerop@gmail.com'
  },
  {
    id: 2
    name: 'Sizzle Pea'
    email: 'patrick@heysparkbox.com'
  }
]
