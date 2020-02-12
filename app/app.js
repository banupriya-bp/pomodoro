$(document).ready(function() {
    app.initialized().then(function(client) {
      window.client=client;
      Initiation_notify();
      client.events.on("app.activated",function()
      {
        Activation_notify(); 
        logged_In();
      });
  },
function(){
  Initialisation_error();
});
});

function clear1()
{
  let end=get_end();
  for(i=1;i<=end;i++)
  {
    client.db.delete(i);
  }
}
function Initiation_notify(){
  client.interface.trigger("showNotify",{
    type: "success",
    message:"Initiated!!"
 })
}
function Activation_notify(){
  client.interface.trigger("showNotify",{
    type: "success",
    message:"Activated!!"
 })
}

function logged_In(){
  client.data.get('loggedInUser')
  .then(function() {
    client.data.get('loggedInUser')
        .then(function(data) {
            $('#doneBy').text("Todo list created by " + data.loggedInUser.user.name);
        })
        .catch(function(e) {
            console.log('Exception - ', e);
        });
       });
      }

function List_blank()
{
  client.interface.trigger("showNotify", {
    type: "warning",
    message: "Type Something!!"
  })
}

function List_Entry()
            {
              let index;
              let to_do=document.getElementById("search").value;
              document.getElementById("search").value="";
              
              if(to_do)
              {
                index=get_End();
                index++;
                client.db.set(index,{"to_do":to_do,"count":0,"id":index},{setIf: "not_exist"}).then(
                      function() {
                        client.interface.trigger("showNotify",{
                          type: "success",
                          message:"Saved Successfully!!"
                       })
                        client.db.update("end","increment",{i:1}).then(function(){
                                console.log(`end:${i}`);
                        })
                       }
                  ,
                  function()
                  {
                    client.interface.trigger("showNotify", {
                      type: "warning",
                      message: "Already theree!!"
                    })
                  });
              }
              else
              List_blank();
            }

function Initialisation_error()
{
  client.interface.trigger("showNotify",{
    type:"error",
    message:"Initialisation error"
});
}

function delete1(){
  let end=get_end();
  let value1= document.getElementById("delete1").value
  document.getElementById("delete1").value="";
  let matched_id=match(value1);
  client.db.delete(`${matched_id}`).then (
    function(data) {
      console.log(data);
    },
    function(error) {
      console.log(error);
   });
}

function show_all()
{
  client.interface.trigger("showModal", {
    title:"To_do" ,
    template: "next.html"
  }).then(function() {
    client.db.get("end").then(function(data)
    {
       for(let j=1;j<=data.i;i++)
       {
         client.db.get(j).then(function(data)
         {
           document.getElementById("list").innerHTML+=`${j}: ${data.to_do}<br>`
         })
       }
    })
  }).catch(function() {
    client.interface.trigger("showNotify",{
      type:"error",
      message:"Error:Show_page"
  }); 
  });
}

function pomodoro(){
  let end=get_end();
  value1=document.getElementById("pomodoro").value;
  let matched_id=match(value1);
  client.request.invoke('createSchedule', getScheduleData(matched_id)).then(function() {
      client.interface.trigger("showNotify",{
        type:"success",
        message:"Timer has Started!"
      })
    }, function() {
      client.interface.trigger("showNotify",{
        type:"error",
        message:"Oops!! Try Again"
      })
      
  })
  
}

function get_End(){
    client.db.get("end").then(
    function(data)
    {
      return data.i;
    }
  )
}

function match(value){
for(i=1;i<=end;i++)
  {
    client.db.get(i).then(function(data)
    {
      if (data.to_do===value)
      return data.id
    })
  }
}


function getScheduleData(matched_id) {
  const date = new Date();
  date.setMinutes(date.getMinutes()+Number(25));
  const scheduleData = {
    schedule_at: date.toISOString(),
    id=matched_id
  };
  return scheduleData;
}