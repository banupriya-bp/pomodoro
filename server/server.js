
exports = {
  events: [{event: "onAppInstall", callback: "onAppInstallCallback" },
           {event: "onScheduledEvent", callback: "onScheduledEventHandler"}],
  onAppInstallCallback: function(){
    $db.set("end",{"i":0}).then(function(){
    $db.set("schedule",{"scheduled_at":"0",id:"-1"})
    $db.set("time",{"work":0,"break":0,"timer":0})
    renderData()
   })   
  },
  createSchedule: function(args){
    $db.set("time",{"work":0,"break":0,"timer":1})
    $db.set("schedule",{"scheduled_at":args.schedule_at,"id":args.id})
    $schedule.create({
      name :args.schedule_at,
      data: {},
      schedule_at:args.schedule_at,
    })
    .then(function() {
       renderData(null,"success");
    },function(error) {
        renderData(error);
    });
  },
  onScheduledEventHandler: function(){
    $db.get("time").then(function(data)
    {
      if(data.timer===1){
      $db.set("time",{"work":1,"break":0,"timer":0})
      $db.get("schedule").then(function(data){
        id=data.id;
      }).then(function(){
        $db.update(`${id}`,"increment",{count:1})
      }).then(function(){
        $db.get(`${id}`).then(function(data){
        if((data.count)%4===0){
          const date = new Date();
          date.setMinutes(date.getMinutes()+Number(15));
          $db.set("schedule",{"scheduled_at":date.toISOString(),"id":data.index});
          $schedule.create({
            name: date.toISOString(),
            data: {},
            schedule_at: date.toISOString()
          })           
          } 
        else{
          const date = new Date();
          date.setMinutes(date.getMinutes()+Number(6));
          $db.set("schedule",{"scheduled_at":date.toISOString(),"id":data.index});
          $schedule.create({
            name: date.toISOString(),
            data: {},
            schedule_at:date.toISOString()
          })
         }
      })
    })
    }
    if(data.work===1){
      $db.set("time",{"work":0,"break":1,"timer":0})
      $db.set("schedule",{"scheduled_at":"0",id:"-1"});
    }
  })
  }
}

