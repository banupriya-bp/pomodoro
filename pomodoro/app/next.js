$(document).ready(function() {
  app.initialized().then(function(client) {
    document.getElementById("timing").style.visibility = "hidden";
    document.getElementById("timing1").style.visibility = "hidden";
    window.client = client;
    }).then(function(){
        show_all();
    }).then(function(){
       client.db.get("schedule").then(function(data){
        time=data.scheduled_at;
        id=data.id;
        if(time!=0){
        date =new Date();
        date1=new Date(time);
        diff=date1-date;
        min=(Math.floor(diff/60000));
        sec=(Math.floor(diff/1000)%60);
        client.db.get("time").then(function(data){
          if(data.work===1)
            Interval(0,0,min,sec);
          else{
            client.db.get(`${id}`).then(function(data){
              if(((data.count)+1)%4===0)
                Interval(min,sec,"15",0);
              else
                Interval(min,sec,"6",0);
            })}
        })}
    });
});
});

function show_all(){
  let end;
  let prom=[];
  client.db.get("end").then(function(data){
    end=data.i;
  }).then(function(){
      if(end===0)
          document.getElementById("list").innerHTML="No List Available!!"
      else{
        for(j of Array(end).keys())
          prom[j] = client.db.get(`${j}`);
      }
      }).then(function(){
          Promise.all(prom).then(function(data) {
          for(i of Array(end).keys())
          document.getElementById("list").innerHTML+=`<tr><th style="width:30%;">${i+1}:</th><th> ${data[i].to_do}</th></tr>`
      })
      })
}


function delete_item(){
  let value= document.getElementById("delete1").value
  document.getElementById("delete1").value="";
  if(value){
    client.db.get("end").then(
    function(data){
      let matched_id;
      let end=data.i;
      let prom=[];
      let prom1=[];
      let prom2=[];
      for(i of Array(end).keys())
      prom[i]=client.db.get(`${i}`);
      Promise.all(prom).then(function(data){
        for(j of Array(end).keys())
        {
        if(data[j].to_do===value){
          matched_id=data[j].index;
          break;
        }
        }
      }).then(function(){
        for(i of Array(end).keys())
          prom1[i]=client.db.get(`${i}`);
      }).then(function(){
        Promise.all(prom1).then(function(data){
          for(let i=matched_id;i<end-1;i++)
          prom2[i]=client.db.set(i,{"to_do":data[i+1].to_do,"count":data[i+1].count,"index":i});
        });
      }).then(function(){
          Promise.all(prom2).then(function(){
            if(matched_id===undefined){
              client.interface.trigger("showNotify",{
              type: "warning",
              message:"Not in the List!!"
            })
            }
            else{
              client.db.delete(end-1).then(function(){
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
                },function(){
                  client.interface.trigger("showNotify",{
                  type:"error",
                  message:"Not Deleted!!"
                  });
                  });
                }});   
           })});
          }
  else{
    client.interface.trigger("showNotify", {
    type: "warning",
    message: "Type Something!!"
  })
}
}
function set_pomodoro(){
  let matched_id;
  let end;
  let prom=[];
  let count;
  let m1;
  document.getElementById("timing").style.visibility = "hidden";
  document.getElementById("timing1").style.visibility = "hidden";
  let value=document.getElementById("pomodoro").value;
  document.getElementById("pomodoro").value=""
  if(value){
    client.db.get("schedule").then(function(data){
      if(data.scheduled_at==="0"){
        client.db.get("end").then(function(data){
          end=data.i;
          for(i of Array(end).keys())
          {
            prom[i]=client.db.get(`${i}`);
          }
          Promise.all(prom).then(function(data){
            for(j of Array(end).keys())
            {
            if(data[j].to_do===value){
              matched_id=j;
              count=(data[j].count)+1;
              if(count%4==0)
                m1=15;
              else
                m1=6;
            break;
            }
            }
            }).then(function(){
              if(matched_id===undefined){
                client.interface.trigger("showNotify",{
                type: "warning",
                message:"Not in the List!!"
                })
                }
              else{
                client.request.invoke("createSchedule", getScheduleData(matched_id)).then(function(){
                  let m="6",s="00";
                  let s1="00";
                  client.interface.trigger("showNotify",{
                  type:"success",
                  message:"25 Minutes Timer has Started!"
                  });
                  Interval(m,s,m1,s1);
                },function(){
                  client.interface.trigger("showNotify",{
                  type:"error",
                  message:"Oops!! Try Again"
                });
            });
          }}) 
        });
      }
      else{
        client.interface.trigger("showNotify", {
        type: "warning",
        message: "Task is on going!!"
        })
      }

    })
}
else{
  client.interface.trigger("showNotify", {
  type: "warning",
  message: "Type Something!!"
  })
}
}

function getScheduleData(matched_id) {
  const date = new Date();
  date.setMinutes(date.getMinutes()+Number(6));
  const scheduleData = {
    schedule_at: date.toISOString(),
    id: matched_id
    };
  return scheduleData;
}
function Interval(m,s,m1,s1){
  let x=m1;
  setInterval(function(){
    client.db.get("time").then(function(data){
      if(data.work===1){
        document.getElementById("timing").style.visibility = "visible";
        document.getElementById("timing1").innerHTML=`Break for ${x} minutes`;
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
      if(data.break===1){
        document.getElementById("timing").style.visibility = "visible";
        document.getElementById("timing1").style.visibility = "hidden";
        document.getElementById("timing").innerHTML="break completed!!!"
      }
      if(data.timer===1){
        document.getElementById("timing").style.visibility = "visible";
        document.getElementById("timing1").innerHTML="Time is running...."
        document.getElementById("timing1").style.visibility ="visible";
        if(m>=0)
          document.getElementById("timing").innerHTML=`${m}min:${s}sec`;
        else
          document.getElementById("timing").innerHTML="time up!!...";
          document.getElementById("timing1").style.visibility ="hidden";
        s--;
        if(s<0){
          s=59;
          m--;
        }
      }
  })
  },1000);
}

  