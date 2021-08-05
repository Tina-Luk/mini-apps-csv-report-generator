const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const fs = require('fs');

const app = express();

app.use(express.static('client'));
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(fileUpload());

app.post('/upload_json', (req, res) => {
  let data = JSON.parse(req.files.JSON.data.toString());
  let filterString = req.body.filter || null;
  // let data = JSON.parse(req.body.JSON);
  addUniqueId(data)
  let flattened = flatten(data);
  filter(flattened, filterString);
  let csv = columnHeadings(flattened[1]) + '\n' + convertValuesToCSV(flattened);
  console.log(csv);
  fs.writeFile('samples/last_csv_report.csv', csv, 'utf8', (err) => {
    if (err) throw err;
    console.log('The file has been saved!');
  });
  res.send(`
  <p>csv generator response: </p>
  <p>${csv.replace(/\n/g, '<br />')}<p>
  `);
});

app.get('/download', (req, res) => {
  res.download('samples/last_csv_report.csv');
});

const port = 3000;
app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`);
});

let convertValuesToCSV = function (flattened, csv = '') {
  for (let i = 0; i < flattened.length; i++) {
    for (let key in flattened[i]) {
      if (typeof flattened[i][key] !== 'object') {
        csv += flattened[i][key] + ',';
      }
    }
    csv = csv.substring(0, csv.length - 1);
    csv += '\n';
  }
  return csv;
};

let columnHeadings = function (JSON) {
  let csvHeadings = '';
  for (let key in JSON) {
    if (typeof JSON[key] !== 'object') {
      csvHeadings += key + ',';
    }
  }
  csvHeadings = csvHeadings.substring(0, csvHeadings.length - 1);
  return csvHeadings;
};

let flatten = function (object, flattened = []) {
  flattened.push(object);
  for (key in object) {
    if (typeof object[key] === 'object') {
      let children = object[key];
      for (let i = 0; i < children.length; i++) {
        children[i]['parentId'] = object['Id'];
        flatten(children[i], flattened, id + 1);
      }
    }
  }
  return flattened;
};

let id = 0;
let addUniqueId = function (obj) {
  id += 1;
  obj['Id'] = id;
  for (key in obj) {
    if (typeof obj[key] === 'object') {
      let children = obj[key];
      for (let i = 0; i < children.length; i++) {
        addUniqueId(children[i]);
      }
    }
  }
};


let filter = function(array, filterText) {
  let deleteRow = false;
  for (let i = 0; i < array.length; i++) {
    let object = array[i];
    for (let key in object) {
      if (typeof object[key] !== 'object') {
        if (object[key].toString().includes(filterText)) {
          deleteRow = true;
        }
      }
    }
    if (deleteRow) {
      array.splice(i, 1);
      deleteRow = false;
    }
  }
  return array;
}
