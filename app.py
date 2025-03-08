from flask import Flask, request, jsonify
import google.generativeai as genai
import os
from dotenv import load_dotenv

app = Flask(__name__)

# LOADING AND CONFIGURING API
load_dotenv()  # Load environment variables from .env
API_KEY = os.getenv("GEMINI_API_KEY")  # Fetch the API key

if not API_KEY:
    raise ValueError("API Key not found! Make sure it's in your .env file.")

# Now use the API key securely
genai.configure(api_key=API_KEY)
model = genai.GenerativeModel("gemini-2.0-flash")

# Storage for multiple tasks
tasks = []

# TO GET ALL TASKS
@app.route("/task", methods=["GET"])
def get_tasks():
    return jsonify({"tasks": tasks})  # Return list of tasks

# TO CREATE A NEW TASK:SUBTASKS
@app.route("/task", methods=["POST"])
def create_task():
    data = request.json
    main_task = data.get("main_task", "")

    if not main_task:
        return jsonify({"error": "No main task provided"}), 400

    new_task = {
        "main_task": main_task,
        "subtasks": [],  # Empty list for now
        "completed": False  # Default status is not completed
    }

    tasks.append(new_task)
    return jsonify({"message": "Task added", "task": new_task}), 201


# TO CREATE A NEW TASK:SUBTASKS
@app.route("/generate", methods=["POST"])
def generate():
    data = request.json  # Get JSON data from the request
    prompt = data.get("prompt", "")

    if not prompt:
        return jsonify({"error": "No prompt provided"}), 400
    
    instructions = """List at least 3 and at most 5 subtasks for this task in bullet point format ONLY.
                    DO NOT include any explanations, introductions, or conclusions.
                    DO NOT add numbering or extra text. Use ONLY bullet points, like this:
                    - First subtask
                    - Second subtask
                    - Third subtask

                    Now generate subtasks for this task: """
    
    formatted_prompt = instructions + prompt

    response = model.generate_content(formatted_prompt)
    subtasks = [line.strip("* ").strip() for line in response.text.strip().split("\n") if line.startswith("*")]

    return jsonify({"reply": subtasks})

if __name__ == "__main__":
    app.run(debug=True)