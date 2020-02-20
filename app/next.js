$(document).ready(function() {
    app.initialized().then(function(client) {
        document.getElementById("timing").style.visibility = "hidden";
        document.getElementById("timing1").style.visibility = "hidden";
        
        window.client = client;
        show_all();
    });
});

function show_all()
{
    client.db.get("end").then(function(data)
    {
      let end=data.i;
      if(end===0)
        {
           document.getElementById("list").innerHTML="No List Available!!"
        }
        else
        {
            
      let prom=[];
      for(j of Array(end).keys())
        {
          prom[j] = client.db.get(`${j}`);
        }
        console.log(prom);
        Promise.all(prom).then(function(data) {
            console.log(data);
          for(i of Array(end).keys())
          {
          document.getElementById("list").innerHTML+=`<tr><th style="width:30%;">${i+1}:</th><th> ${data[i].to_do}</th></tr>`
          }
        }).catch(function(error) {
            console.error(error);
        });
    }},function(){
      console.log("error in getting end in show-all!!!")
    })
}
function delete1(){
    let value= document.getElementById("delete1").value
    document.getElementById("delete1").value="";
    if(value)
    {
    client.db.get("end").then(
      function(data){
      let matched_id;
      let end=data.i;
      let prom=[];
      let prom1=[];
      let prom2=[];
      for(i of Array(end).keys())
      {
        prom[i]=client.db.get(`${i}`);
      }
      Promise.all(prom).then(function(data)
      {
         for(j of Array(end).keys())
        {
          if(data[j].to_do===value)
          {
            matched_id=data[j].index;
             break;
          }
        }
      }).then(function(){
        for(i of Array(end).keys())
        {
          prom1[i]=client.db.get(`${i}`);
        }
       }).then(function(data){
        Promise.all(prom1).then(function(data)
        {
           for(let i=matched_id;i<end-1;i++)
          {
            prom2[i]=client.db.set(i,{"to_do":data[i+1].to_do,"count":data[i+1].count,"index":i});
          }
    
        });
       }).then(function(){
        Promise.all(prom2).then(function()
        {
          if(matched_id===undefined)
          {
            client.interface.trigger("showNotify",{
                type: "success",
                message:"Not in the List!!"
              })
          }
          else
          {
          client.db.delete(end-1).then (
            function(data) {
                
              client.db.get("end").then(function(data){
                  let end=(data.i)-1;
                  client.db.set("end",{"i":end}).then(function(){
                      document.getElementById("list").innerHTML="";
                      show_all();
                  })
              }).then (function(){
              client.interface.trigger("showNotify",{
                type: "success",
                message:"Deleted!!"
              })
          });
              
           },
            function() {
              client.interface.trigger("showNotify",{
                type:"error",
                message:"Not Deleted!!"
            });
           });
        }
        });    

       })
       
        
  },function(){
    console.log("error in getting end in delete");
  });
}
else
{
    client.interface.trigger("showNotify", {
        type: "warning",
        message: "Type Something!!"
      })
}
}
function pomodoro(){
    document.getElementById("timing").style.visibility = "hidden";
    document.getElementById("timing1").style.visibility = "hidden";
    let value=document.getElementById("pomodoro").value;
    console.log("value entered....");
    console.log(value);
    if(value)
    {
    client.db.get("time").then(function(data){
       if(data.on_gng===0)
        {
            client.db.get("end").then(
                function(data){
                let matched_id;
                let end=data.i;
                let prom=[];
                let count;
                for(i of Array(end).keys())
                {
                  prom[i]=new Promise((resolve)=>
                  {
                    resolve(client.db.get(i))
                  })
                }
                Promise.all(prom).then(function(data)
                {
                  console.log(data);
                  for(j of Array(end).keys())
                  {
                      console.log(j);
                      console.log(data[j].to_do);
                    if(data[j].to_do===value)
                    {
                      count=(data[j].count)+1;
                      console.log(count)
                      if(count%4==0)
                      x=15;
                      else
                      x=6;
                      matched_id=data[j].index;
                      console.log(matched_id);
                      break;
                    }
                  }
                }).then(function(){
                    if(matched_id===undefined)
                    {
                        client.interface.trigger("showNotify",{
                            type: "success",
                            message:"Not in the List!!"
                          })
                    }
                    else
                    {
                  client.request.invoke("createSchedule", getScheduleData(matched_id)).then(function() {
                      let m="25",s="00";
                      let m1=x,s1="00";
                      client.interface.trigger("showNotify",{
                        type:"success",
                        message:"25 Minutes Timer has Started!"
                      });
                      setInterval(function(){
                           client.db.get("time").then(function(data){
                               console.log(data);
                               if(data.work===1)
                               {
                                 document.getElementById("timing").style.visibility = "visible";
                                 document.getElementById("timing1").innerHTML=`Break for ${x} minutes`
                                 document.getElementById("timing1").style.visibility = "visible";
                                 if(m1>=0)
                                 document.getElementById("timing").innerHTML=`${m1}min:${s1}sec`;
                                 s1--;
                                 if(s1<0)
                                 {
                                     s1=59;
                                     m1--;
                                 }
                                }
                               if(data.break===1)
                               {
                                        document.getElementById("timing").style.visibility = "visible";
                                        document.getElementById("timing1").style.visibility = "hidden";
                                        document.getElementById("timing").innerHTML="break completed!!!"
                                        
                               }
                               if(data.timer===1)
                               {
                                   document.getElementById("timing").style.visibility = "visible";
                                   document.getElementById("timing1").style.visibility ="visible";
                                   document.getElementById("timing1").innerHTML="Time is running...."
                                   if(m>=0)
                                   document.getElementById("timing").innerHTML=`${m}min:${s}sec`;
                                   else
                                   document.getElementById("timing").innerHTML="time up!!...";
                                   s--;
                                   if(s<0)
                                   {
                                       s=59;
                                       m--;
                                   }
          
                               }
                          
                           },function(error){
                               console.log(error);
                               console.log("errrrrooorrr")
                           })
                          },1000);
                     },function(error)
                  {
                       client.interface.trigger("showNotify",{
                        type:"error",
                        message:"Oops!! Try Again"
                      });
                    console.log(error)
                  });
                }

                }) 
              
            },function()
            {
              console.log("error in getting end in pomodoro!!")
            });
        }
        if(data.on_gng===1)
        {
            client.interface.trigger("showNotify", {
                type: "warning",
                message: "Task is on going!!"
              })
        }

    })
}
else
{
    client.interface.trigger("showNotify", {
        type: "warning",
        message: "Type Something!!"
      })
}
}

function getScheduleData(matched_id) {
    const date = new Date();
    date.setMinutes(date.getMinutes()+Number(25));
    const scheduleData = {
      schedule_at: date.toISOString(),
      id: matched_id
    };
    return scheduleData;
  }

  