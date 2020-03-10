$(document).ready(function () {
  app.initialized().then(function (client) {
    window.client = client;
    client.events.on("app.activated", function () {
      client.instance.resize({ height: "300px" }).then(function(){
        logged_In();
      })
    }, function () {
      Activation_error();
    });
  },
    function () {
      Initialisation_error();
    });
});

function logged_In() {
  client.data.get('loggedInUser')
    .then(function (data) {
      $('#doneBy').text("Todo list created by " + data.loggedInUser.user.name);
    });
}

function Initialisation_error() {
  client.interface.trigger("showNotify", {
    type: "error",
    message: "Initialisation error"
  });
}

function Activation_error() {
  client.interface.trigger("showNotify", {
    type: "error",
    message: "Activation error"
  });
}

function Add_Item() {
  let index;
  let to_do = document.getElementById("search").value;
  document.getElementById("search").value = "";
  if (to_do) {
    client.db.get("end").then(function (data) {
      index = data.i;
    }).then(function () {
      client.db.set(`${index}`, { "to_do": to_do, "count": 0, "index": index });
    }).then(function () {
      client.interface.trigger("showNotify", {
        type: "success",
        message: "Saved Successfully!!"
      })
    }).then(function () {
      client.db.update("end", "increment", { i: 1 })
    }).then(function () {
        summary();
    });
  }
  else
    Is_Empty();
}

function Is_Empty() {
  client.interface.trigger("showNotify", {
    type: "warning",
    message: "Type Something!!"
  })
}


function clear1() {
  document.getElementById("list_summary").style.visibility = "hidden";
  let end;
  let prom = [];
  client.db.get("end").then(function (data) {
      end = data.i;
    }).then(function () {
      for (j of Array(end).keys()) {
        prom[j] = client.db.delete(`${j}`);
      }
    }).then(function () {
      Promise.all(prom).then(function () {
        client.db.set("end", { i: 0 })
      }).then(function(){
          summary();
      }).then(function(){
          client.interface.trigger("showNotify", {
          type: "success",
          message: "cleared!!"
        })
      })
    })
  }

function show_all() {
  client.interface.trigger("showModal", {
    title: "To_do List",
    template: "next.html"
  });
}

function summary() {
  document.getElementById("list_summary").style.visibility = "visible";
  let end;
  let prom = [];
  client.db.get("end").then(function (data) {
    end = data.i;
  }).then(function () {
    for (i of Array(end).keys())
      prom[i] = client.db.get(i);
  }).then(function () {
    Promise.all(prom).then(function (data) {
      if (end === 0) {
        document.getElementById("list_summary").innerHTML = `No Task Available`
      }
      else {
        document.getElementById("list_summary").innerHTML = "<tr><th>TASK</th><th>NO OF TIMES EXECUTED</th><th>TOTAL TIME</th>"
        for (i of Array(end).keys()) 
        document.getElementById("list_summary").innerHTML += `<tr><td>${data[i].to_do}</td><td>${data[i].count} times</td><td>${data[i].count * 25}mins</td>`;
      }
    })
  })
}


