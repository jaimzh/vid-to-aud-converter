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

    // Display the selected file details
    console.log('Selected file:', file.name);

    selectedFile = file; // Store the selected file

    // Optionally, update the UI to show file info
    const fileInfoElement = document.createElement('p');
    fileInfoElement.textContent = `Selected file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
    
    // Remove any existing file info
    const existingFileInfo = dragndropArea.querySelector('.file-info');
    if (existingFileInfo) {
        dragndropArea.removeChild(existingFileInfo);
    }
    
    fileInfoElement.classList.add('file-info');
    dragndropArea.appendChild(fileInfoElement);
}

function convertFile(conversionType) {
    if (!selectedFile) {
        alert('Please select a video file first!');
        return;
    }

    // Log file details for debugging
    console.log('File details:', {
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size
    });

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
            progressBar.querySelector('div').style.width = `${progress}%`;  // Update the progress bar width
        }
    });

    // Track the overall response progress (download)
    xhr.onload = () => {
        if (xhr.status === 200) {
            progressBar.querySelector('div').style.width = '100%';

            const blob = xhr.response;  // Now xhr.response *should* be a Blob

            if (blob instanceof Blob) { // Add a check for Blob type
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `converted-file.${conversionType}`;
                link.click();
                alert('Conversion complete!');
            } else {
                console.error("xhr.response is not a Blob:", xhr.response);
                alert('Conversion failed: Invalid response type.'); // More informative error message
            }
        } else {
            progressBar.style.display = 'none';
            alert('Conversion failed');
        }
    };

    // Handle errors
    xhr.onerror = () => {
        progressBar.style.display = 'none';
        alert('An error occurred during conversion');
    };

    // Send the request with the form data
    xhr.send(formData);
}

// Event listeners for the convert buttons
convertToMp3Btn.addEventListener('click', () => {
    convertFile('mp3'); // Call the convert function with 'mp3' type
});

convertToWavBtn.addEventListener('click', () => {
    convertFile('wav'); // Call the convert function with 'wav' type
});
