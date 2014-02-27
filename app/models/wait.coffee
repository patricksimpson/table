App.Wait = FP.Model.extend
 person: FP.hasOne("person", {embedded:false})
 createdAt: FP.attr 'date'
