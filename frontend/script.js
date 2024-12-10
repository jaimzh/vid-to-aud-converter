let selectedFile = null;  // Variable to keep track of the selected file
const dragndropArea = document.querySelector('.dragndrop');
const chooseFilesLink = document.querySelector('#choose-files');
const progressBar = document.querySelector('.progressbar');
const convertToWavBtn = document.querySelector('#convert-to-wav');
const convertToMp3Btn = document.querySelector('#convert-to-mp3');

dragndropArea.addEventListener('dragover', (event) => {
    event.preventDefault(); // Prevents the default behavior of the drag
    dragndropArea.classList.add('dragging'); // Add a visual effect to show drag
});

dragndropArea.addEventListener('dragleave', () => {
    dragndropArea.classList.remove('dragging');
});

dragndropArea.addEventListener('drop', (event) => {
    event.preventDefault();
    dragndropArea.classList.remove('dragging'); // Remove drag effect after drop
    const files = event.dataTransfer.files;
    handleFiles(files);
});

chooseFilesLink.addEventListener('click', () => {
    const inputFile = document.createElement('input');
    inputFile.type = 'file';
    inputFile.accept = 'video/mp4';

    inputFile.addEventListener('change', (event) => {
        const files = event.target.files;
        handleFiles(files);
    });
    inputFile.click();
});

function handleFiles(files) {
    if (files.length === 0) return;

    const file = files[0];

    // Validate file type
    if (!file.type.startsWith('video/')) {
        alert('Please upload a video file');
        return;
    }

    // Optional: Size limit (e.g., 1GB)
    if (file.size > 1024 * 1024 * 1024) {
        alert('File is too large. Maximum size is 1GB');
        return;
    }

    selectedFile = file; // Store the selected file

    // Remove any existing file info
    const existingFileInfo = dragndropArea.querySelector('.file-info');
    if (existingFileInfo) {
        dragndropArea.removeChild(existingFileInfo);
    }
    
    // Create new file info element
    const fileInfoElement = document.createElement('p');
    fileInfoElement.classList.add('file-info');
    let fileName = file.name;
    const fileNameTruncated = fileName.slice(0, 10 ) + '...';
    fileInfoElement.textContent = `Selected file: ${fileNameTruncated} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
    dragndropArea.appendChild(fileInfoElement);

    return fileInfoElement;
}

function convertFile(conversionType) {
    if (!selectedFile) {
        alert('Please select a video file first!');
        return;
    }

    // Find the file info element
    const fileInfoElement = dragndropArea.querySelector('.file-info');

    if (fileInfoElement) {
        // Update file info to show converting status
        fileInfoElement.textContent = 'Converting...';
        fileInfoElement.style.color = 'blue';
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    const endpoint = conversionType === 'mp3' ? '/convert_to_mp3' : '/convert_to_wav';

    // Show progress bar
    progressBar.style.display = 'block';
    progressBar.querySelector('div').style.width = '0%';

    // Create a new XMLHttpRequest object
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://vid-to-aud-converter.onrender.com' + endpoint, true);

    // Set responseType to 'blob' to handle binary data
    xhr.responseType = 'blob';

    // Track the upload progress
    xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            progressBar.querySelector('div').style.width = `${progress}%`;
        }
    });

    // Track the overall response progress (download)
    xhr.onload = () => {
        if (xhr.status === 200) {
            progressBar.querySelector('div').style.width = '100%';

            const blob = xhr.response;

            if (blob instanceof Blob) {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `converted-file.${conversionType}`;
                link.click();
                
                // Update file info on successful conversion
                if (fileInfoElement) {
                    fileInfoElement.textContent = 'CONVERSION COMPLETE BABY LETS GOOOO!!! Thank God this thing worked';
                    fileInfoElement.style.color = 'green';
                }
            } else {
                console.error("xhr.response is not a Blob:", xhr.response);
                
                // Update file info on conversion failure
                if (fileInfoElement) {
                    fileInfoElement.textContent = 'Conversion failed: Invalid response type.';
                    fileInfoElement.style.color = 'red';
                }
            }
        } else {
            progressBar.style.display = 'none';
            
            // Update file info on HTTP error
            if (fileInfoElement) {
                fileInfoElement.textContent = 'Conversion failed';
                fileInfoElement.style.color = 'red';
            }
        }
    };

    // Handle errors
    xhr.onerror = () => {
        progressBar.style.display = 'none';
        
        // Update file info on network error
        if (fileInfoElement) {
            fileInfoElement.textContent = 'An error occurred during conversion';
            fileInfoElement.style.color = 'red';
        }
    };

    // Send the request with the form data
    xhr.send(formData);
}

// Event listeners for the convert buttons
convertToMp3Btn.addEventListener('click', () => {
    convertFile('mp3');
});

convertToWavBtn.addEventListener('click', () => {
    convertFile('wav');
});