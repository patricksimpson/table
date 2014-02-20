App.Person = FP.Model.extend
  name: FP.attr 'string'
  twitter: FP.attr 'string'
  email: FP.attr 'string'
  created_at: FP.attr 'date'
  is_admin: FP.attr 'boolean'
  games: FP.hasMany("games", {embedded: false, as: "games"})
