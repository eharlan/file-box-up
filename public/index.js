
const input = document.getElementById('fileUpload')
input.onchange = function(event) {
    const selectedFiles = event.target.files;
    for (const file of selectedFiles) {
        console.log(file.name, file.size)
    }

  }