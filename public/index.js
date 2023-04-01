const input = document.getElementById('fileUpload')
const copyBtn = document.getElementById('copyBtn')
const printBtn = document.getElementById('print-tab')
const printFiles = document.getElementById('print')

const bar = document.querySelector('.progress');
const barProgress = document.querySelector('.progress-bar');
const alertBox = document.querySelector('.alert-success');

let currentFile = '';

let selectedFiles = null;
let clip = '';

const renderFiles = () => {

  axios({
    method: 'get',
    url: '/files',
  })
    .then(function(response){
      if(!response.data){
        return false;
      }

      let files = '<div><ol id="file-list">';

      Object.entries(response.data).forEach(element => {
        const name = String(element[1].file).split('/').pop(); 
        files += `
        <li class="my-1">
          <div class="container-fluid">
            <div class="row align-items-start"><div class="col-md-3 col-sm-auto">
          <a href="/download?file=${encodeURIComponent(name)}">${name}</a>
          </div>
          <div class="col-sm-9 align-self-start">
          <button onclick="getFileName(event.target, 'file-text-content');getFileInfo(event.target);" data-bs-toggle="modal" data-bs-target="#file-info" class="btn btn-sm btn-outline-secondary mr-2" type="button">
          <i class="bi bi-pencil"></i>
          </button>
          <button data-bs-toggle="modal" data-bs-target="#print-confirm" class="btn btn-md btn-light mx-2" onclick="getFileName(event.target, 'print-text-content');">
          <i class="bi bi-printer"></i>
          </button>
          </div>
          </div>
          </div>
          </li>
          `
      })

      files += '</ol></div>'
      printFiles.innerHTML = files;

    })
    .catch(function(error){
      console.log('File list error: '+error)
    })
}

printBtn.onclick = (event) => {
  event.preventDefault();
  renderFiles();
}

copyBtn.onclick = (event) => {
  event.preventDefault();

  if (clip){
    prompt('Uploaded Files:',clip);	
  }
}

const getFileInfo = (file) => {
  const name = String(file.parentElement.parentElement.parentElement.children[0].textContent).trim();

  axios({
    method: 'get',
    url: '/info/'+name
  })
    .then(function(response){
      console.log(response)
    })
    .catch(function(error){
      console.log('Info error: '+error)
    })

}

const getFileName = (file, target) => {

  let leadText = "Print ";

  if(target.includes('file')){
    leadText = "Info for "
  }

  const fileEl = file.parentElement.parentElement.parentElement.children;
  document.getElementsByClassName(target)[0].innerHTML = leadText + fileEl[0].textContent;

  currentFile = fileEl[0].textContent.trim();
}

input.onchange = function(event) {
  selectedFiles = event.target.files;

  if(alertBox.classList.contains('show')){
    alertBox.classList.toggle('d-none');
    alertBox.classList.toggle('show');
  }

  for (const file of selectedFiles) {
    console.log(file.name, file.size)
  }

}

const deleteFile = () => {

  axios({
    method: 'DELETE',
    url: '/delete/'+currentFile
  })
    .then(function(response){
      const modalEl = document.getElementById('delete-confirm');
      const modal = bootstrap.Modal.getInstance(modalEl).hide()
      
      renderFiles();
    })
    .catch(function(error){
      console.log('Info error: '+error)
    })

}

function formSubmit(event){
  event.preventDefault();

 if(!selectedFiles){
    return false;
 }

  if(alertBox.classList.contains('show')){
    alertBox.classList.toggle('show');
    alertBox.classList.toggle('d-none');
  }

  bar.classList.toggle('d-none')


  clip = '';

  const bodyFormData = new FormData();
  for(const file of selectedFiles){
    bodyFormData.append('files', file);
    clip += `${window.location.origin}/download?file=${file.name}', `
  }

  clip = clip.slice(0, -3);

  axios({
    method: 'post',
    url: '/uploads',
    data: bodyFormData,
    onUploadProgress: p => {
      const value = Math.floor((p.loaded/p.total)*100)+'%';
      barProgress.style.width = value;
      barProgress.innerHTML = value;

    },
    headers: {"Content-Type": "multipart/form-data"}
  })
    .then(function(response){
      console.log('success!: '+response);
      alertBox.classList.toggle('show');
      alertBox.classList.toggle('d-none');
      input.value = '';
    })
    .catch(function(error){
      console.log('Upload error: '+error)
    })
    .finally(function(){
      setTimeout(() => {
        bar.classList.toggle('d-none');
        barProgress.style.width = '0%';
        barProgress.innerHTML = '0%';
      },2000)		
    });
}
