const input = document.getElementById('fileUpload')
let selectedFiles = null;

input.onchange = function(event) {
    selectedFiles = event.target.files;
    
    for (const file of selectedFiles) {
        console.log(file.name, file.size)
    }

  }

function formSubmit(event){
    event.preventDefault();
    axios.post('/uploads',{
        files:selectedFiles
    })

}