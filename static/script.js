document.addEventListener("DOMContentLoaded", function() {
    const uploadForm = document.getElementById('uploadForm');
    const imageInput = document.getElementById('imageInput');
    const originalImageContainer = document.getElementById('originalImageContainer');
    const resultContainer = document.getElementById('resultContainer');
    const loadingSpinner = document.getElementById('loadingSpinner');

    function showLoading() {
        loadingSpinner.style.display = 'block';
    }

    function hideLoading() {
        loadingSpinner.style.display = 'none';
    }

    imageInput.addEventListener('change', function() {
        resultContainer.innerHTML = ''; // Clear previous result
        if (this.files && this.files[0]) {
            const imageUrl = URL.createObjectURL(this.files[0]);
            originalImageContainer.innerHTML = `<img src="${imageUrl}" alt="Original Image"/>`;
        }
    });

    uploadForm.addEventListener('submit', function(e) {
        e.preventDefault();
        showLoading();
        const formData = new FormData(uploadForm);

        fetch('/upload', {
            method: 'POST',
            body: formData
        }).then(response => response.json())
          .then(data => {
              hideLoading();
              if (data.processed_image) {
                  const timeStamp = new Date().getTime();
                  resultContainer.innerHTML = `<img src="${data.processed_image}?t=${timeStamp}" alt="Processed Image"/>`;
                  const downloadButton = document.createElement('button');
                  downloadButton.innerText = 'Download Result';
                  downloadButton.addEventListener('click', function() {
                      const link = document.createElement('a');
                      link.href = `${data.processed_image}?t=${timeStamp}`;
                      link.download = 'processed_image.png';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                  });
                  resultContainer.appendChild(downloadButton);
              } else {
                  resultContainer.innerHTML = `<p>Image processing failed.</p>`;
              }
          }).catch(error => {
              hideLoading();
              console.error('Error:', error);
              resultContainer.innerHTML = `<p>An error occurred while processing.</p>`;
          });
    });
});
