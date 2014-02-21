App.Game = FP.Model.extend
  home: FP.hasOne("person", {embedded: false})
  away: FP.hasOne("person", {embedded: false})
  complete: FP.attr 'boolean'
  created_at: FP.attr 'date'
  rounds: FP.hasMany("rounds", {embedded: true, as: "rounds"})
