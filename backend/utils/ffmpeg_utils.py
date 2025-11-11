import ffmpeg
import uuid

def convert_file_to_mp3(input_file: str) -> str | None:
    unique_suffix = str(uuid.uuid4())[:8]
    output_file = input_file.replace('.mp4', f'_{unique_suffix}.mp3')
    print(f"Converting {input_file} → {output_file}")

    try:
        (
            ffmpeg.input(input_file)
            .output(output_file, acodec="libmp3lame")
            .run(capture_stdout=True, capture_stderr=True)
        )
        print(f"Conversion complete: {output_file}")
        return output_file
    except ffmpeg.Error as e:
        err_msg = e.stderr.decode() if e.stderr else "No FFmpeg error message"
        print(f"Error during MP3 conversion: {err_msg}")
        return None


def convert_to_wav(input_file: str) -> str | None:
    unique_suffix = str(uuid.uuid4())[:8]
    output_file = input_file.replace('.mp4', f'_{unique_suffix}.wav')
    print(f"Converting {input_file} → {output_file}")

    try:
        (
            ffmpeg.input(input_file)
            .output(output_file, acodec="pcm_s16le", ar="44100", ac="2")
            .run(capture_stdout=True, capture_stderr=True)
        )
        print(f"Conversion complete: {output_file}")
        return output_file
    except ffmpeg.Error as e:
        err_msg = e.stderr.decode() if e.stderr else "No FFmpeg error message"
        print(f"Error during WAV conversion: {err_msg}")
        return None
