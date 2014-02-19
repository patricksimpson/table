App.Person = FP.Model.extend
  name: FP.attr 'string'
  twitter: FP.attr 'string'
  email: FP.attr 'string'
  create_date: FP.attr 'date'
  games: FP.hasMany("games", {embedded: false, as: "games"})
  user: FP.hasOne("user", {embedded: false})
