const fs = require('fs');
const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser')
const multer = require('multer');
const morgan = require('morgan');

const UPLOAD_PATH = 'uploads/';
const upload = multer({ dest: UPLOAD_PATH })

const app = express();
const port = 5000;

app.use(cors());
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('tiny'));


app.get('/', (req, res) => {
  res.send('Printer API')
});

app.post(`/${UPLOAD_PATH.replace('/','')}`, upload.array('files'), (req, res) => {
    console.log('Got body:', req.body, 'files:', req.files);
    res.sendStatus(200);
});

app.listen(port, () => {
    if(!fs.existsSync(UPLOAD_PATH)){
      fs.mkdirSync(UPLOAD_PATH)  
    }
  console.log(`Printer API listening on port ${port}\nUPLOAD_PATH: ${UPLOAD_PATH}`)
})