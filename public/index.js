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

const yyyymmdd = (date) => {
  const now = new Date(date);
  const y = now.getFullYear();
  const m = now.getMonth() + 1;
  const d = now.getDate();
  const mm = m < 10 ? '0' + m : m;
  const dd = d < 10 ? '0' + d : d;
  return '' + y + mm + dd;
}

const renderFiles = () => {

  axios({
    method: 'get',
    url: '/files',
  })
    .then(function(response){
      if(!response.data){
        return false;
      }


      let files = `<table class="table sortable">
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">Name</th>
          <th scope="col">Date Created</th>
        </tr>
      </thead>
      <tbody>`;

      Object.entries(response.data).forEach((element, index) => {
        const ctime = new Date(element[1].stats.ctime);
        const options = {
          hour: 'numeric',
          minute: 'numeric',
          hour12: true
        };
        const timeString = ctime.toLocaleString('en-US', options);
        
        const name = String(element[1].file).split('/').pop(); 
        files += `
          <tr>
            <th scope="row">
            ${index+1}
            </th>
            <td>
            <a href="/download?file=${encodeURIComponent(name)}">${name}</a>
            </td>
            <td data-sort="${yyyymmdd(ctime)}">${ctime.toUTCString()
              .replace(/(\d{2})\s(\D{3})/, "$2 $1")
              .replace(/(\d{2}:\d{2}:\d{2}).*/, timeString)}
            <button onclick="getFileName(event.target, 'file-text-content');getFileInfo(event.target);" data-bs-toggle="modal" data-bs-target="#file-info" class="btn btn-sm btn-outline-primary" type="button">
            <i class="bi bi-info-circle"></i>
            </button>
            </td>
          </tr>
          `
      })

      files += `</tbody></table>`
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
