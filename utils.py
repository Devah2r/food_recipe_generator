import google.generativeai as genai
import os
api_key="AIzaSyDxpdBEqg0Tm5W1sbgvOzLo0b9jhL7OKC4" #enter yor gemini apikey
genai.configure(api_key=api_key)
model = genai.GenerativeModel("gemini-1.5-flash")

def recipe_generator(user_input):
    response = model.generate_content("You are an expert chef and recipe generator. "

        "Only provide answers related to cooking, recipes, and ingredients. "
        "If a question is not related to cooking, please respond with 'I can only assist with cooking-related inquiries.' "
        "output format:choose one dish,summarize the dish,list all ingredients,prepation of recipe"
        f"User Input: {user_input}")
    return response.text

