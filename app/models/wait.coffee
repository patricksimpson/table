App.Wait = FP.Model.extend
 person: FP.hasOne("person", {embedded:false})
 created_at: FP.attr 'date'
