from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId

app = Flask(__name__)
CORS(app)

# MongoDB connection
client = MongoClient('mongodb://localhost:27017/')
db = client['Vdata']
overlay_collection = db['overlays']

# URL of the RTSP stream (replace with your actual URL)
rtsp_url = 'rtsp://zephyr.rtsp.stream/movie?streamKey=9cd4f37df5c11434c6ff024e93d9cfa0'

# Landing Page Route - This will render the landing.html template
@app.route('/')
def landing_page():
    return render_template('landing.html', rtsp_url=rtsp_url)

# API Endpoint to Create a New Overlay
@app.route('/api/overlays', methods=['POST'])
def create_overlay():
    try:
        data = request.json
        result = overlay_collection.insert_one(data)
        created_overlay = overlay_collection.find_one({'_id': result.inserted_id})
        return jsonify({'message': 'Overlay created successfully', 'overlay': created_overlay}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# API Endpoint to Get All Overlays
@app.route('/api/overlays', methods=['GET'])
def get_overlays():
    overlays = list(overlay_collection.find())
    return jsonify(overlays), 200

# API Endpoint to Get a Specific Overlay by ID
@app.route('/api/overlays/<string:overlay_id>', methods=['GET'])
def get_overlay(overlay_id):
    try:
        overlay = overlay_collection.find_one({'_id': ObjectId(overlay_id)})
        if overlay:
            return jsonify(overlay), 200
        else:
            return jsonify({'message': 'Overlay not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# API Endpoint to Update an Existing Overlay by ID
@app.route('/api/overlays/<string:overlay_id>', methods=['PUT'])
def update_overlay(overlay_id):
    try:
        data = request.json
        result = overlay_collection.update_one({'_id': ObjectId(overlay_id)}, {'$set': data})
        if result.modified_count > 0:
            updated_overlay = overlay_collection.find_one({'_id': ObjectId(overlay_id)})
            return jsonify({'message': 'Overlay updated successfully', 'overlay': updated_overlay}), 200
        else:
            return jsonify({'message': 'No overlay was updated'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# API Endpoint to Delete an Overlay by ID
@app.route('/api/overlays/<string:overlay_id>', methods=['DELETE'])
def delete_overlay(overlay_id):
    try:
        result = overlay_collection.delete_one({'_id': ObjectId(overlay_id)})
        if result.deleted_count > 0:
            return jsonify({'message': 'Overlay deleted successfully'}), 200
        else:
            return jsonify({'message': 'No overlay was deleted'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
