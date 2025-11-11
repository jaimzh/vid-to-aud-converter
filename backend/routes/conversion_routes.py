import os
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from utils.ffmpeg_utils import convert_file_to_mp3, convert_to_wav

router = APIRouter(tags=["Audio Conversion"])


@router.post("/convert_to_mp3")
async def convert_to_mp3_endpoint(file: UploadFile = File(...)):
    input_file = f"temp_{file.filename}"

    try:
        print(f"Received file: {file.filename} ({file.content_type})")

        # Save temporarily
        with open(input_file, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        if not os.path.exists(input_file):
            raise HTTPException(status_code=400, detail="File could not be saved")

        print(
            f"File saved successfully: {input_file} ({os.path.getsize(input_file)} bytes)"
        )

        # Convert to MP3
        output_file = convert_file_to_mp3(input_file)
        if not output_file:
            raise HTTPException(status_code=400, detail="MP3 conversion failed")

        return FileResponse(
            output_file, filename=os.path.basename(output_file), media_type="audio/mp3"
        )

    except Exception as e:
        print(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if os.path.exists(input_file):
            os.remove(input_file)
            print(f"Deleted temporary input file: {input_file}")


@router.post("/convert_to_wav")
async def convert_to_wav_endpoint(file: UploadFile = File(...)):
    input_file = f"temp_{file.filename}"

    try:
        print(f"Received file: {file.filename} ({file.content_type})")

        # Save temporarily
        with open(input_file, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        if not os.path.exists(input_file):
            raise HTTPException(status_code=400, detail="File could not be saved")

        print(
            f"File saved successfully: {input_file} ({os.path.getsize(input_file)} bytes)"
        )

        # Convert to WAV
        output_file = convert_to_wav(input_file)
        if not output_file:
            raise HTTPException(status_code=400, detail="WAV conversion failed")

        return FileResponse(
            output_file, filename=os.path.basename(output_file), media_type="audio/wav"
        )

    except Exception as e:
        print(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if os.path.exists(input_file):
            os.remove(input_file)
            print(f"Deleted temporary input file: {input_file}")
