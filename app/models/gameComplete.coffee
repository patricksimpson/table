App.GameComplete = FP.Model.extend
  games: FP.hasMany("game", {embedded: false})