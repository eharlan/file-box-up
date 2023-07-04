const fs = require('fs');
const cors = require('cors');
const express = require('express');
let busboy = require('connect-busboy')
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
        file: dirFile,
        stats: dirent
      });
    }
  }
  return filelist;
}

const UPLOAD_PATH = process.env.UPLOAD_DIR || '/uploads';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.options('*', cors());
app.use(express.static(__dirname + '/public'))
//app.use(busboy()); 
app.use(morgan('tiny'));

const isEncoded = (str) => {
    return typeof str == "string" && decodeURIComponent(str) !== str;
}

app.get('/', (req, res) => {
  res.send('Printer API')
});

app.get('/files', (req, res) => {
  const dirTree = walkSync(__dirname+'/'+UPLOAD_PATH);
  
  if(dirTree.length){
    return res.send(JSON.stringify(walkSync(__dirname+'/'+UPLOAD_PATH)))
  }
  
  res.status(204).send({})

});

app.get('/info/:file', (req, res) => {

  let fileInfo = String(req.params.file).trim();

//  if(isEncoded(fileInfo)){
//    fileInfo = decodeURIComponent(fileInfo)
//  }

  const {size, ctime, mtime} = fs.statSync(__dirname+'/'+UPLOAD_PATH+fileInfo)

  res.status(200).send({
    "name": fileInfo,
    "size": size,
    "createdAt": ctime,
    "modifiedAt": mtime
  })
});

app.delete('/delete/:file', (req, res) => {
  let file = String(req.params.file).trim();

  fs.unlinkSync(__dirname+'/'+UPLOAD_PATH+file);

  res.status(200).send({});
});

app.get('/download', function(req, res){
  const reqFile = req.query.file;
  let file = `${__dirname}/uploads/${reqFile}`;
  
  if(isEncoded(reqFile)){
    file = file.replace(reqFile, decodeURIComponent(reqFile));
  }

  res.download(file);
});

// app.post(`/${UPLOAD_PATH.replace('/','')}`, upload.array('files', 100), (req, res) => {
// //  morgan.log('Got body:', req.body, 'files:', req.files);
//   res.send(req.files, 200);
// }, (error, req, res, next) => {
//   res.status(400).send({error: error.message})
// });

const uploadFile = (req, filePath) => {
  return new Promise((resolve, reject) => {
   const stream = fs.createWriteStream(filePath);
   // With the open - event, data will start being written
   // from the request to the stream's destination path
   stream.on('open', () => {
    console.log('Stream open ...  0.00%');
    req.pipe(stream);
   });
 
   // Drain is fired whenever a data chunk is written.
   // When that happens, print how much data has been written yet.
   stream.on('drain', () => {
    const written = parseInt(stream.bytesWritten);
    const total = parseInt(req.headers['content-length']);
    const pWritten = ((written / total) * 100).toFixed(2);
    console.log(`Processing  ...  ${pWritten}% done`);
   });
 
   // When the stream is finished, print a final message
   // Also, resolve the location of the file to calling function
   stream.on('close', () => {
    console.log('Processing  ...  100%');
    resolve(filePath);
   });
    // If something goes wrong, reject the primise
   stream.on('error', err => {
    console.error(err);
    reject(err);
   });
  });
 };
 
 // Add a route to accept incoming post requests for the fileupload.
 // Also, attach two callback functions to handle the response.
 app.post(`${UPLOAD_PATH}`, (req, res) => {
  let fstream;
  req.pipe(req.busboy);
  req.busboy.on('file', function (fieldname, file, filename) {
      console.log("Uploading: " + filename); 
      fstream = fs.createWriteStream(path.join(`/${UPLOAD_PATH.replace('/','')}`, filename));
      file.pipe(fstream);
      fstream.on('close', function () {
          console.log('File Uploaded!')
      });
  })
 });

app.listen(port, () => {
  if(!fs.existsSync(UPLOAD_PATH)){
    fs.mkdirSync(UPLOAD_PATH)  
  }
  console.log(`File Box API listening on port ${port}\nUPLOAD_PATH: ${UPLOAD_PATH}`)
})
