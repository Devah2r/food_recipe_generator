import google.generativeai as genai
import os
import speech_recognition as sr
import time

def recognize_speech_from_mic():
    # Initialize recognizer
    recognizer = sr.Recognizer()

    # Use the microphone as the audio source
    try:
        with sr.Microphone() as source:
            print("Adjusting for ambient noise...")
            recognizer.adjust_for_ambient_noise(source, duration=1)
            print("Listening for speech...")
            
            # Capture audio
            audio = recognizer.listen(source)
        
        # Recognize speech using Google Web Speech API
        print("Recognizing speech...")
        text = recognizer.recognize_google(audio)
        print(f"Recognized Text: {text}")
        return text

    except sr.RequestError:
        # API was unreachable or unresponsive
        print("API unavailable or unresponsive. Try again later.")
        return None
    except sr.UnknownValueError:
        # Speech was unintelligible
        print("Unable to recognize the speech. Please try again.")
        return None
    except AttributeError:
        # Handle microphone not available or another microphone issue
        print("Microphone error. Please check the microphone connection.")
        return None

# Configure generative AI with API key
api_key = "AIzaSyDxpdBEqg0Tm5W1sbgvOzLo0b9jhL7OKC4"  # Enter your Gemini API key
genai.configure(api_key=api_key)
model = genai.GenerativeModel("gemini-1.5-flash")

# Main loop for recognizing speech and generating responses
while True:
    user_input = recognize_speech_from_mic()
    
    # Check if user wants to quit or if user_input is None
    if user_input is None:
        continue  # Skip to the next iteration if no valid input is captured
    if "quit" in user_input:
        break

    # Generate content using the AI model
    response = model.generate_content(
        "You are an expert chef and recipe generator. "
        "Only provide answers related to cooking, recipes, and ingredients. "
        "If a question is not related to cooking, please respond with 'I can only assist with cooking-related inquiries.' "
        "Output format: Choose one dish, summarize the dish, list all ingredients, and provide preparation steps. "
        f"User Input: {user_input}"
    )
    print(response.text)
