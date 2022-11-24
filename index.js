const fs = require('fs');
const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser')
const multer = require('multer');
const morgan = require('morgan');
const path = require('path')

const walkSync = (dir, filelist = []) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const dirFile = path.join(dir, file);
    const dirent = fs.statSync(dirFile);
    if (dirent.isDirectory()) {
      var odir = {
        dir: dirFile,
        files: []
      }
      odir.files = walkSync(dirFile, dir.files);
      filelist.push(odir);
    } else {
      filelist.push({
        file: dirFile
      });
    }
  }
  return filelist;
}

const UPLOAD_PATH = 'uploads/';
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `./${UPLOAD_PATH}`)
  },
  filename: function (req, file, cb) {
    var filename = file.originalname;
    var fileExtension = filename.split(".")[1];

    return cb(null, filename);
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

const isEncoded = (str) => {
    return typeof str == "string" && decodeURIComponent(str) !== str;
}

app.get('/', (req, res) => {
  res.send('Printer API')
});

app.get('/files', (req, res) => {
  const dirTree = walkSync(__dirname+'/uploads/');
  
  if(dirTree.length){
    return res.send(JSON.stringify(walkSync(__dirname+'/uploads/')))
  }
  
  res.status(204).send({})

});

app.get('/download', function(req, res){
  const reqFile = req.query.file;
  let file = `${__dirname}/uploads/${reqFile}`;
  
  if(isEncoded(reqFile)){
    file = file.replace(reqFile, decodeURIComponent(reqFile));
  }

  res.download(file);
});

app.post(`/${UPLOAD_PATH.replace('/','')}`, upload.array('files', 100), (req, res) => {
//  morgan.log('Got body:', req.body, 'files:', req.files);
  res.send(req.files, 200);
}, (error, req, res, next) => {
  res.status(400).send({error: error.message})
});

app.listen(port, () => {
  if(!fs.existsSync(UPLOAD_PATH)){
    fs.mkdirSync(UPLOAD_PATH)  
  }
  console.log(`Printer API listening on port ${port}\nUPLOAD_PATH: ${UPLOAD_PATH}`)
})
