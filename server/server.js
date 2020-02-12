
exports = {
  events: [
    { event: "onAppInstall", callback: "onAppInstallCallback" },{ event: "onScheduledEvent", callback: "onScheduledEventHandler" }],
  onAppInstallCallback: function() {
    $db.set("end",{"i":0}).then(function(){
      console.log("success");
   })
    //renderData();
  },
  createSchedule: function(args){
      $schedule.create({
      schedule_at:args.schedule_at,
    })
    .then(function(data) {
      
      renderData(null,"success")
    }, function(err) {
        renderData(error)
    });

  },
  onScheduledEventHandler:  function(args){
    $db.update(args.id,"increment",{count:1});
    break1(args.id);
  },
  break1:   function(id){
    $db.get(id).then(function(data){
      if(data.count%4===0)
      {
        console.log("5 mins break!!")
      }
      else{
        console.log("15 mins break!!")
      }
    })
  }

}

