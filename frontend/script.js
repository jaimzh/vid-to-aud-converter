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

    // Optionally, update the UI to show file info (e.g., name, size)
    // Example: 
    // document.querySelector('.file-info').textContent = `File: ${file.name}, Size: ${file.size}`;
}

// Function to handle the conversion
function convertFile(conversionType) {
    if (!selectedFile) {
        alert('Please select a video file first!');
        return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    const endpoint = conversionType === 'mp3' ? '/convert_to_mp3' : '/convert_to_wav';

    fetch('https://vid-to-aud-converter.onrender.com' + endpoint, {
        method: 'POST',
        body: formData,
        headers: {
            // If needed, add headers such as Authorization or others
            // 'Authorization': 'Bearer <your-token>',
        }
    })
        .then(response => response.blob())
        .then(blob => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'converted-file';  // You can specify a dynamic file name here
            link.click();
        })
        .catch(error => {
            console.error('Error:', error);
            alert("There was an error converting the file");
        });
}

// Event listeners for the convert buttons
convertToMp3Btn.addEventListener('click', () => {
    convertFile('mp3'); // Call the convert function with 'mp3' type
});

convertToWavBtn.addEventListener('click', () => {
    convertFile('wav'); // Call the convert function with 'wav' type
});
