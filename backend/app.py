from flask import Flask
from dotenv import load_dotenv
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)
app.config.from_object('instance.config')
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

@app.route('/')
def home():
    return 'Flask Backend Ready!'

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)


@app.route('/api/data')
def get_data():
    return {'data': [1, 2, 3]}
