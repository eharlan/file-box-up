const input = document.getElementById('fileUpload')
const copyBtn = document.getElementById('copyBtn')
const printBtn = document.getElementById('print-tab')
const printFiles = document.getElementById('print')

const bar = document.querySelector('.progress');
const barProgress = document.querySelector('.progress-bar');
const alertBox = document.querySelector('.alert-success');

let selectedFiles = null;
let clip = '';


printBtn.onclick = (event) => {
  event.preventDefault();

  axios({
    method: 'get',
    url: '/files',
  })
    .then(function(response){
      if(!response.data){
        return false;
      }

      let files = '<div><ol id="list">';

      Object.entries(response.data).forEach(element => {
        const name = String(element[1].file).split('/').pop();
        files += `<li><div class="container-fluid"><div class="row"><div class="col-1"><a href="/download?file=${encodeURIComponent(name)}">${name}</a></div><div class="col-1"><button class="btn btn-sm btn-outline-success" type="button"><i class="bi bi-pencil"></i></button></div><div class="col-1"><button class="btn btn-sm btn-outline-warning"><i class="bi bi-printer"></i></button></div></div></div></li>`
      })

      files += '</ol></div>'
      printFiles.innerHTML = files;

    })
    .catch(function(error){
      console.log('File list error: '+error)
    })
}

copyBtn.onclick = (event) => {
  event.preventDefault();

  if (clip){
    prompt('Uploaded Files:',clip);	
  }
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


function formSubmit(event){
  event.preventDefault();

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
