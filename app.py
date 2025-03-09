from flask import Flask, request, jsonify
import google.generativeai as genai
import os
from dotenv import load_dotenv
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# LOADING AND CONFIGURING API
load_dotenv()  # Load environment variables from .env
API_KEY = os.getenv("GEMINI_API_KEY")  # Fetch the API key

if not API_KEY:
    raise ValueError("API Key not found! Make sure it's in your .env file.")

# Now use the API key securely
genai.configure(api_key=API_KEY)
model = genai.GenerativeModel("gemini-2.0-flash")

# TO GENERATE SUBTASKS FOR A TASK
@app.route("/generate", methods=["POST"])
def generate():
    data = request.json  # Get JSON data from the request
    main_task = data.get("main_task", "")

    if not main_task:
        return jsonify({"error": "No main task provided"}), 400
    
    instructions = """List at least 3 and at most 5 subtasks for this task in bullet point format ONLY.
                    Each subtask should be a clear action step with a MAXIMUM of 6 words.
                    DO NOT include any explanations, introductions, or conclusions.
                    DO NOT add numbering or extra text. Use ONLY bullet points, like this:
                    - First subtask (max 6 words)
                    - Second subtask (max 6 words)
                    - Third subtask (max 6 words)

                    Now generate subtasks for this task: """
    
    formatted_prompt = instructions + main_task

    response = model.generate_content(formatted_prompt)
    subtasks = [{"task": line.strip("-*• ").strip(), "completed": False} for line in response.text.strip().split("\n") if line.startswith(("-", "*", "•"))] 
    
    new_task = {
        "main_task": main_task,
        "subtasks": subtasks,
        "completed": False
    }

    return jsonify({"reply": new_task})

if __name__ == "__main__":
    app.run(debug=True)