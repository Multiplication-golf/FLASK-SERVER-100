const express = require('express');
const app = express();
const cors = require('cors');
const fs = require('fs');

app.use(cors());

// Enable CORS for all routes
function addspace() {
  for (let i = 0; i < 4; i++) {
    console.log("\n");
  }
}

app.get('/', (req, res) => {
  res.send("hello");
});

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/returnjson', (req, res) => {
  fs.readFile("courses.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    res.send(JSON.parse(data));
  });
});

app.get('/returnLevel/:course', (req, res) => {
  fs.readFile("courses.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    const course = req.params.course;
    const jsonData = JSON.parse(data);
    const levelData = jsonData[course]["levelData"];
    res.send(levelData);
  });
});

app.get('/returnHowManyLevels/:course', (req, res) => {
  fs.readFile("courses.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    const course = req.params.course;
    const jsonData = JSON.parse(data);
    const levelData = jsonData[course]["levelData"];
    res.send(levelData.length.toString());
  });
});

app.get('/returnPoints/:course', (req, res) => {
  fs.readFile("courses.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    const course = req.params.course;
    const jsonData = JSON.parse(data);
    const levelPoints = jsonData[course]["LevelPoints"];
    res.send(levelPoints);
  });
});

app.get('/returnIncorrectPoints/:course', (req, res) => {
  fs.readFile("courses.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    const course = req.params.course;
    const jsonData = JSON.parse(data);
    const incorrectPoints = jsonData[course]["incorrectpoints"];
    res.send(incorrectPoints);
  });
});

function compact_json() {
  fs.readFile("courses.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    try {
      const jsonData = JSON.parse(data);
      const compactJson = JSON.stringify(jsonData, null, 0);
      fs.writeFile("courses.json", compactJson, (err) => {
        if (err) {
          console.error(err);
          return;
        }
      });
    } catch (error) {
      console.error("Invalid JSON format!");
      return;
    }
  });
}

app.post('/levelSubmit/:rawdata/:name/:key', (req, res) => {
  let rawdata = req.params.rawdata.replace("%20", "").replace("false", "False");
  rawdata = eval(rawdata);

  function transform_data(input_data) {
    const rand_name = req.params.name;
    const output_data = { [rand_name]: {} };
    const levelData = [];
    const pointData = [];
    const incorrectpointData = [];

    function getlevelData() {
      for (const data in input_data) {
        levelData.push(input_data[data]["baselist"]);
      }
      return levelData;
    }

    function LevelPoints() {
      for (const data in input_data) {
        pointData.push(input_data[data]["data_to_send"]);
      }
      return pointData;
    }

    function LevelInCorrectPoints() {
      for (const data in input_data) {
        incorrectpointData.push(input_data[data]["incorrect_point_data_to_send"]);
      }
      return incorrectpointData;
    }

    output_data["name"] = rand_name;
    output_data["key"] = req.params.key;
    output_data["levelData"] = getlevelData();
    output_data["LevelPoints"] = LevelPoints();
    output_data["incorrectpoints"] = LevelInCorrectPoints();
    output_data["rawdata"] = rawdata;

    return output_data;
  }

  fs.readFile("courses.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    const jsonData = JSON.parse(data);
    jsonData[req.params.name] = transform_data(rawdata);
    addspace();
    console.log(jsonData[req.params.name]);
    addspace();
    fs.writeFile("courses.json", JSON.stringify(jsonData, null, 4), (err) => {
      if (err) {
        console.error(err);
        return;
      }
      compact_json();
      res.send("level submitted");
    });
  });
});

compact_json();

app.get('/loadFromKey/:key', (req, res) => {
  let data__ = {};
  fs.readFile("courses.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    const jsonData = JSON.parse(data);
    for (const course in jsonData) {
      if (jsonData[course]["key"] === req.params.key) {
        data__ = jsonData[course]["rawdata"];
        break;
      }
    }
    res.send(data__);
  });
});

function __sort__(data) {
  const user_list = Object.entries(data).map(([key, value]) => [key, ...value]);
  const sorted_data = user_list.sort((a, b) => b[2] - a[2]).map((item, index) => [...item, index + 1]);
  return sorted_data;
}

app.get('/GetleaderBoard/', (req, res) => {
  fs.readFile("users.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    const jsonData = JSON.parse(data);
    const sorted_data = __sort__(jsonData["users"]);
    res.json(sorted_data);
  });
});

app.post('/ADDplayer/:money/:playerName', (req, res) => {
  let data__ = {};
  fs.readFile("users.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    const jsonData = JSON.parse(data);
    jsonData["users"][req.params.playerName] = [req.params.playerName, parseInt(req.params.money)];
    console.log(jsonData);
    fs.writeFile("users.json", JSON.stringify(jsonData, null, 4), (err) => {
      if (err) {
        console.error(err);
        return;
      }
      res.send(jsonData);
    });
  });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});