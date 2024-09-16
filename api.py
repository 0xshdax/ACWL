from flask import Blueprint, request, jsonify, session
import sqlite3

api = Blueprint('api', __name__)

def connect_db(db_name):
    try:
        return sqlite3.connect(db_name)
    except sqlite3.Error as e:
        raise Exception(f"Database connection failed: {str(e)}")

def user_is_logged_in():
    return session.get('logged_in', False)

def get_inventory_data():
    try:
        with connect_db('inventory.db') as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id, name, product, available, category, price FROM inventory")
            return cursor.fetchall()
    except sqlite3.Error as e:
        raise Exception(f"Failed to fetch inventory data: {str(e)}")

def update_inventory_data(id, name, product, available, category, price):
    try:
        with connect_db('inventory.db') as conn:
            cursor = conn.cursor()
            update_query = """
            UPDATE inventory
            SET name = ?, product = ?, available = ?, category = ?, price = ?
            WHERE id = ?
            """

            cursor.execute(update_query, (name, product, available, category, price, id))
            conn.commit()

            if cursor.rowcount == 0:
                raise Exception("No record found with the provided ID.")
            
            return True
            
    except sqlite3.Error as e:
        raise Exception(f"Failed to update inventory data: {str(e)}")

@api.route('/api/v2/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    try:
        with connect_db('users.db') as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM users WHERE email=? AND password=?", (email, password))
            user = cursor.fetchone()

        if user:
            session['logged_in'] = True
            session['first_name'] = user[1]
            session['role'] = user[5]
            return jsonify({"message": "Login successful", "user": {"email": email}}), 200
        else:
            return jsonify({"message": "Invalid credentials"}), 401
    except sqlite3.Error as e:
        return jsonify({"message": f"Database error: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@api.route('/api/v2/register', methods=['POST'])
def register():
    data = request.get_json()
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    email = data.get('email')
    password = data.get('password')

    if not all([first_name, last_name, email, password]):
        return jsonify({"message": "All fields are required"}), 400

    role = 'user'
    status = 1

    try:
        with connect_db('users.db') as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO users (first_name, last_name, email, password, role, status)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (first_name, last_name, email, password, role, status))
            conn.commit()
        return jsonify({"message": "User registered successfully"}), 201
    except sqlite3.IntegrityError:
        return jsonify({"message": "User with this email already exists"}), 409
    except sqlite3.Error as e:
        return jsonify({"message": f"Database error: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"message": str(e)}), 500

## Inventory
@api.route('/api/v2/inventory', methods=['GET', 'POST'])
def inventory():
    if not user_is_logged_in():
        return jsonify({"message": "Access denied"}), 403

    if request.method == 'GET':
        try:
            data = get_inventory_data()
            inventory_list = [{
                'id': row[0],
                'name': row[1],
                'product': row[2],
                'available': row[3],
                'category': row[4],
                'price': row[5]
            } for row in data]
            return jsonify(inventory_list), 200
        except Exception as e:
            return jsonify({"message": str(e)}), 500

    elif request.method == 'POST':
        try:
            data = request.get_json()

            id = data.get('id')
            name = data.get('name')
            product = data.get('product')
            available = data.get('available')
            category = data.get('category')
            price = data.get('price')
            
            if not all([id, name, product, available, category, price]):
                return jsonify({"message": "Missing required fields"}), 400

            success = update_inventory_data(id, name, product, available, category, price)
            if success:
                return jsonify({"message": "Inventory updated successfully"}), 200
            else:
                return jsonify({"message": "Failed to update inventory"}), 500
            
        except Exception as e:
            return jsonify({"message": str(e)}), 500

## Users Management
@api.route('/api/v2/users', methods=['GET'])
def get_users():
    if not user_is_logged_in():
        return jsonify({"message": "Access denied"}), 403
    try:
        with connect_db('users.db') as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id, first_name, last_name, email, role, status FROM users")
            rows = cursor.fetchall()

        users = [{
            'id': row[0],
            'first_name': row[1],
            'last_name': row[2],
            'email': row[3],
            'role': row[4],
            'status': row[5]
        } for row in rows]

        return jsonify(users), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500