$(document).ready(function() {
    app.initialized().then(function(client) {
      window.client=client;
      Initiation_notify();
      client.events.on("app.activated",function()
      {
        Activation_notify(); 
        logged_In();
      },function(error){
        console.error(error);
        Activation_error();
      });
  },
function(error){
  console.error(error);
  Initialisation_error();
});
});

function clear1()
{
  client.db.get("end").then(
    function(data)
    {
      let end=data.i;
      let prom=[];
      for(j of Array(end).keys())
      {
        prom[j]=new Promise((resolve)=>
        {
        resolve(client.db.delete(j))
        });
      }
      Promise.all(prom).then(function()
      {
        client.db.set("end",{i:0}).then(function(){
          console.log("successfully cleared the end value");
        },function(){
          console.log("end hasnt changed!")
        });
        client.interface.trigger("showNotify",{
          type: "success",
          message:"cleared!!"
       })
      })
    },function(){
      console.log("error in getting end in clear-all")
    })
}
function Initiation_notify(){
  console.log('initiation notification');
  client.interface.trigger("showNotify",{
    type: "success",
    message:"Initiated!!"
 }).then(console.log).catch(console.error);
}
function Activation_notify(){
  client.interface.trigger("showNotify",{
    type: "success",
    message:"Activated!!"
 })
}

function logged_In(){
  console.log('logged in');
    client.data.get('loggedInUser')
        .then(function(data) {
            $('#doneBy').text("Todo list created by " + data.loggedInUser.user.name);
        })
        .catch(function(e) {
            console.log('Exception - ', e);
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
              let to_do=document.getElementById("search").value;
              document.getElementById("search").value="";
              
              if(to_do)
              {
                console.log(to_do);
                client.db.get("end").then(
                  function(data)
                  {
                    let index;
                    console.log("Initial value");
                    index=data.i;
                    console.log(index);
                    client.db.set(index,{"to_do":to_do,"count":0,"index":index},).then(
                      function() {
                        client.interface.trigger("showNotify",{
                          type: "success",
                          message:"Saved Successfully!!"
                       })
                        client.db.update("end","increment",{i:1}).then(function(){
                          console.log("Incremented end");
                        },function(){
                          console.log("error in incrementing!!")
                        });
                        
                      },function()
                      {
                        console.log("error in setting it to db!!")
                      });
                    },
                  function()
                  {
                    console.log("not able to get end!!");
                    client.interface.trigger("showNotify", {
                      type: "error",
                      message: "Not Saved!!"
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

function Activation_error()
{
  client.interface.trigger("showNotify",{
    type:"error",
    message:"Activation error"
});
}

function delete1(){
  let value= document.getElementById("delete1").value
  document.getElementById("delete1").value="";
  client.db.get("end").then(
    function(data){
    let matched_id;
    let end=data.i;
    let prom=[];
    let prom1=[];
    let prom2=[];
    console.log("while deleting...The last element index is");
    console.log(end-1);
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
        if(data[j].to_do===value)
        {
          matched_id=data[j].index;
          console.log(matched_id)
        }
      }
    })  
    for(let i=0;i<end;i++)
    {
      prom1[i]=new Promise((resolve)=>
      {
        resolve(client.db.get(i))
      })
    }
    Promise.all(prom1).then(function(data)
    {
      for(let i=matched_id;i<end-1;i++)
      {
        prom2[i]=new Promise((resolve)=>
        {
          resolve(client.db.set(i,{"to_do":data[i+1].to_do,"count":data[i+1].count},{setIf: "exist"}));
        })
      }

    });
    Promise.all(prom2).then(function()
    {
      client.db.delete(end-1).then (
        function() {
          client.interface.trigger("showNotify",{
            type: "success",
            message:"Deleted!!"
          })
       },
        function() {
          console.log("no such element!!")
          client.interface.trigger("showNotify",{
            type:"error",
            message:"Not Deleted!!"
        });
       });
    });
    
},function(){
  console.log("error in getting end in delete");
});
}

function show_all()
{ 
  client.interface.trigger("showModal", {
    title:"To_do List" ,
    template: "next.html"
  }).then(function() {
    client.db.get("end").then(function(data)
    {
    },function(){
      console.log("error in getting end in show-all!!!")
    })
  },function(error) {
    console.error(error);
  });
}


