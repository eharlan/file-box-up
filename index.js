const fs = require('fs');
const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser')
const multer = require('multer');
const morgan = require('morgan');

const UPLOAD_PATH = 'uploads/';
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `./${UPLOAD_PATH}`)
  },
  filename: function (req, file, cb) {
    var filename = file.originalname;
    var fileExtension = filename.split(".")[1];
    cb(null, filename+'_'+new Date().toISOString());
  }
});

const upload = multer({ storage: storage })

const app = express();
const port = 5000;

app.use(cors());
app.options('*', cors());
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('tiny'));


app.get('/', (req, res) => {
  res.send('Printer API')
});

app.post(`/${UPLOAD_PATH.replace('/','')}`, upload.array('files', 100), (req, res) => {
  console.log('Got body:', req.body, 'files:', req.files);
  res.send(req.files);
}, (error, req, res, next) => {
  res.status(400).send({error: error.message})
});

app.listen(port, () => {
  if(!fs.existsSync(UPLOAD_PATH)){
    fs.mkdirSync(UPLOAD_PATH)  
  }
  console.log(`Printer API listening on port ${port}\nUPLOAD_PATH: ${UPLOAD_PATH}`)
})
