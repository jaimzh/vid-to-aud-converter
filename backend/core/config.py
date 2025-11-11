import subprocess

def check_ffmpeg_installed():
    try:
        subprocess.run(
            ["ffmpeg", "-version"],
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        print("✅ FFmpeg is installed.")
    except subprocess.CalledProcessError as e:
        print(f"❌ FFmpeg is not installed. Error: {e}")
