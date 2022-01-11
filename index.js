const Redis = require("ioredis");
const express = require("express");
var methodOverride = require("method-override");

const { v1: uuidv1, v4: uuidv4 } = require("uuid");

const PORT = 8000;

const REDIS_HOST = "127.0.0.1";
const REDIS_PORT = 6379;

const redis = new Redis({
  port: REDIS_PORT,
  host: REDIS_HOST,
});

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(methodOverride("_method"));

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
  redis.get("triggerArr", (err, result) => {
    if (err) {
      console.error(err);
    } else {
      console.log(result);
      triggers = JSON.parse(result);
      if (!triggers) {
        triggers = [];
        triggers_json = JSON.stringify(triggers);
        if(!triggers){
            triggers = []
            triggers_json = JSON.stringify(triggers)
            if(!triggers){
                triggers = []
                triggers_json = JSON.stringify(triggers)
                redis.set("triggerArr", triggers_json)
            }
            redis.set("triggerArr", triggers_json)
        }
        redis.set("triggerArr", triggers_json);
      }
      res.render("pages/index", {
        triggers: triggers,
      });
    }
  });
});

app.get("/about", (req, res) => {
  res.render("pages/about");
});

app.get("/edit", (req, res) => {
  const id = req.query.id;
  const name = req.query.name;
  const option = req.query.option;
  const value = req.query.value;
  console.log("EDIT Page for id", id, "opened");
  res.render("pages/edit", {
    id: id,
    name: name,
    option: option,
    value: value,
  });
});

app.post("/triggers", (req, res) => {
  console.log("POST Request to /triggers");
  console.log(req.body);
  var trigger = {
    id: uuidv4(),
    trigger_name: req.body.name,
    trigger_option: req.body.option,
    trigger_value: parseInt(req.body.value),
  };
  redis.get("triggerArr", (err, result) => {
    if (err) {
      console.error(err);
    } else {
      console.log(result);
      triggers = JSON.parse(result);
      triggers.push(trigger);
      console.log(triggers);
      triggers_json = JSON.stringify(triggers);
      redis.set("triggerArr", triggers_json);
      res.redirect("/");
    }
  });
});

app.put("/triggers/:id", (req, res) => {
  console.log("PUT Request to /triggers");
  console.log(req.body);
  var id = req.params.id;
  var new_trigger = {
    id: id,
    trigger_name: req.body.name,
    trigger_option: req.body.option,
    trigger_value: parseInt(req.body.value),
  };
  redis.get("triggerArr", (err, result) => {
    if (err) {
      console.error(err);
    } else {
      console.log(result);
      triggers = JSON.parse(result);
      for (i in triggers) {
        if (triggers[i].id === id) {
          triggers[i] = new_trigger;
          break;
        }
      }
      console.log(triggers);
      triggers_json = JSON.stringify(triggers);
      redis.set("triggerArr", triggers_json);
      res.redirect("/");
    }
  });
});

app.delete("/triggers/:id", (req, res) => {
  var id = req.params.id;
  console.log("Request to Delete Trigger ID :", id);
  redis.get("triggerArr", (err, result) => {
    if (err) {
      console.error(err);
    } else {
      console.log(result);
      triggers = JSON.parse(result);
      for (i in triggers) {
        if (triggers[i].id === id) {
          triggers.splice(i, 1);
          break;
        }
      }
      console.log(triggers);
      triggers_json = JSON.stringify(triggers);
      redis.set("triggerArr", triggers_json);
      res.redirect("/");
    }
  });
});

app.listen(PORT, () => {
  console.log(`App listening on port : ${PORT}`);
});
