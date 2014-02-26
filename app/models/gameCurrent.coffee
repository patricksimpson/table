App.GamePending = FP.Model.extend
  games: FP.hasMany("game", {embedded: false})