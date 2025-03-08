from flask import Flask, request, jsonify
import google.generativeai as genai

app = Flask(__name__)

genai.configure(api_key="AIzaSyBJTmr3n_AUm-_c7_EFxE73XO_ksXVbvRM")
model = genai.GenerativeModel("gemini-2.0-flash")

@app.route("/generate", methods=["POST"])
def generate():
    data = request.json  # Get JSON data from the request
    prompt = data.get("prompt", "")

    if not prompt:
        return jsonify({"error": "No prompt provided"}), 400

    response = model.generate_content(prompt)
    return jsonify({"reply": response.text})

if __name__ == "__main__":
    app.run(debug=True)