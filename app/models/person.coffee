App.Person = FP.Model.extend(
  name: FP.attr 'string'
  email: FP.attr 'string'
  games: FP.hasMany("games", {embedded: false, as: "games"})
)
