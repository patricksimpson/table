App.Game = FP.Model.extend
  home: FP.hasOne("person", {embedded: false})
  away: FP.hasOne("person", {embedded: false})
  is_complete: FP.attr 'boolean'
  is_pending: FP.attr 'boolean'
  created_at: FP.attr 'date'
  rounds: FP.hasMany("rounds")