import shutil
from fastapi.responses import FileResponse
from fastapi import FastAPI, UploadFile, File, HTTPException
import os
import ffmpeg

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Utility function to convert to MP3
def convert_file_to_mp3(input_file):
    output_file = input_file.replace('.mp4', '.mp3')
    print(f"Converting {input_file} to {output_file}")
    try:
        (
            ffmpeg.input(input_file)
            .output(output_file, acodec="libmp3lame")
            .run()
        )
        print(f"Conversion complete: {output_file}")
        return output_file
    except ffmpeg.Error as e:
        print(f"Error during conversion: {e}")
        return None


# Utility function to convert to WAV
def convert_to_wav(input_file):
    output_file = input_file.replace('.mp4', '.wav')
    try:
        (
            ffmpeg.input(input_file)
            .output(output_file, acodec="pcm_s16le", ar="44100", ac="2")
            .run()
        )
        print(f"Conversion complete: {output_file}")
        return output_file
    except ffmpeg.Error as e:
        print(f"Error during conversion: {e}")
        return None


# POST endpoint to convert to MP3
@app.post("/convert_to_mp3")
async def convert_to_mp3_endpoint(file: UploadFile = File(...)):
    # Use a unique temporary file name
    input_file = f"temp_{file.filename}"

    try:
        # Save uploaded file temporarily
        with open(input_file, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Convert the file to MP3
        output_file = convert_file_to_mp3(input_file)

        if output_file:
            # Return the converted file as a download
            return FileResponse(output_file, filename=output_file, media_type="audio/mp3")
        else:
            raise HTTPException(status_code=400, detail="MP3 conversion failed")
    finally:
        # Clean up temporary files
        if os.path.exists(input_file):
            os.remove(input_file)
            print(f"Deleted input file: {input_file}")
        
            
# POST endpoint to convert to WAV
@app.post("/convert_to_wav")
async def convert_to_wav_endpoint(file: UploadFile = File(...)):
    # Same structure as the MP3 conversion endpoint
    input_file = f"temp_{file.filename}"

    try:
        # Save uploaded file temporarily
        with open(input_file, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Convert the file to WAV
        output_file = convert_to_wav(input_file)

        if output_file:
            # Return the converted file as a download
            return FileResponse(output_file, filename=output_file, media_type="audio/wav")
        else:
            raise HTTPException(status_code=400, detail="WAV conversion failed")
    finally:
        # Clean up temporary files
        if os.path.exists(input_file):
            os.remove(input_file)
            print(f"Deleted input file: {input_file}")