# backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from utils import recipe_generator  # Import the function from dev.py
import speech_recognition as sr
from pydub import AudioSegment

import os


app = Flask(__name__)
CORS(app)  # Enable CORS for cross-origin requests

@app.route('/generate-recipe', methods=['POST'])
def generate_recipe():
    data = request.get_json()
    ingredients = data.get('ingredients', '')
    
    # Generate recipes using the function from dev.py
    recipes = recipe_generator(ingredients)
    
    return jsonify({'recipe': recipes})

# Paths for temporary audio files
original_audio_path = 'temp_audio'
wav_audio_path = 'temp_audio.wav'

def clean_temp_files():
    """Remove temporary audio files if they exist."""
    try:
        if os.path.exists(original_audio_path):
            os.remove(original_audio_path)
        if os.path.exists(wav_audio_path):
            os.remove(wav_audio_path)
    except Exception as cleanup_error:
        print(f"Error during cleanup: {cleanup_error}")

# Paths for temporary audio files
original_audio_path = 'temp_audio'
wav_audio_path = 'temp_audio.wav'

@app.route('/process-speech', methods=['POST'])
def process_speech():
    if 'file' not in request.files:
        return jsonify({'error': 'No audio file provided.'}), 400

    audio_file = request.files['file']
    
    # Save the audio file temporarily, overwriting if it exists
    original_audio_file_path = f"{original_audio_path}.{audio_file.filename.rsplit('.', 1)[-1]}"
    audio_file.save(original_audio_file_path)  # Save with original extension

    # Convert to WAV using pydub
    try:
        audio = AudioSegment.from_file(original_audio_file_path)
        audio.export(wav_audio_path, format='wav')
    except Exception as e:
        return jsonify({'error': f'Audio conversion error: {e}'}), 400

    # Initialize the recognizer
    recognizer = sr.Recognizer()

    transcription = ""
    try:
        # Use a context manager to ensure the audio file is closed properly
        with sr.AudioFile(wav_audio_path) as source:
            audio_data = recognizer.record(source)  # Read the entire audio file

        # Recognize speech using Google Web Speech API
        transcription = recognizer.recognize_google(audio_data)
        print(transcription)
        transcription = recipe_generator(transcription)
    except sr.UnknownValueError:
        return jsonify({'error': 'Speech not understood.'}), 400
    except sr.RequestError as e:
        return jsonify({'error': f'Speech recognition service error: {e}'}), 500
    except Exception as e:
        return jsonify({'error': f'An error occurred: {e}'}), 500

    # Instead of cleaning up, just overwrite on the next call
    return jsonify({'recipe': transcription}), 200

if __name__ == '__main__':
    app.run(debug=True)
