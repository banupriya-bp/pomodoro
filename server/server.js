
exports = {
  events: [
    { event: "onAppInstall", callback: "onAppInstallCallback" },{ event: "onScheduledEvent", callback: "onScheduledEventHandler" }],
  onAppInstallCallback: function() {
    $db.set("end",{"i":0}).then(function(){
      $db.set("time",{"work":0,"break":0,"timer":0,"on_gng":0})
      console.log("success");
      renderData()
   })
    
  },
  createSchedule: function(args){
    $db.set("time",{"work":0,"break":0,"timer":1,"on_gng":1})
    console.log(`Scheduling an event to run at - ${args.schedule_at}`);
      $schedule.create({
      name :args.schedule_at,
      data: {"id":args.id,"name":"work"},
      schedule_at:args.schedule_at,
    })
    .then(function() {
       renderData(null,"success");
    }, function(error) {
        renderData(error);
    });

  },
  onScheduledEventHandler:  function(args){
    console.log(args);
    console.log("25 mins over!!!");
    if(args.data.name==="work")
      {
        $db.set("time",{"work":1,"break":0,"timer":0,"on_gng":1})
        //$db.set("time",{"work":0,"break":0,"timer":0})
        $db.update(`${args.data.id}`,"increment",{count:1}).then(function(){
        console.log("incremented!!!")
        },function(error){
          console.log(error);
        })
        $db.get(`${args.data.id}`).then(function(data){
          if((data.count)%4===0)
          {
            const date = new Date();
            date.setMinutes(date.getMinutes()+Number(15));
            $schedule.create({
              name: date.toISOString(),
              data: {"id":args.data.id,"name":"break","break":1},
              schedule_at: date.toISOString()
            }).then(function(){
              console.log("15 mins break....");
            },function(error){
              console.log(error);
              console.log("error in creating");
            })
            
          } 
          else{
            const date = new Date();
            date.setMinutes(date.getMinutes()+Number(6));
            $schedule.create({
              name: date.toISOString(),
              data: {"id":args.data.id,"name":"break","break":1},
              schedule_at:date.toISOString()
            }).then(function(){
              console.log("5 mins break....");
            },function(error)
            {
              console.log(error);
              console.log("error in creating");
            })
            
          }
        },function(error)
        {
          console.log(error);
          console.log("error in getting")
        })
      }
    if(args.data.name==="break")
    {
    $db.set("time",{"work":0,"break":1,"timer":0,"on_gng":0})
    console.log(`${args.data.break} minutes break is over`); 
    //$db.set("time",{"work":0,"break":0,"timer":0})
    }
  }
}

