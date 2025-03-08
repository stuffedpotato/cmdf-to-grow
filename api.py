import google.generativeai as genai

genai.configure(api_key="YOUR_API_KEY")

model = genai.GenerativeModel(model_name="gemini-2.0-flash")

response = model.generate_content("Explain how AI works")

print(response.text)