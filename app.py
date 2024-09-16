from flask import Flask, render_template, redirect, url_for, session
from api import api

app = Flask(__name__)
app.secret_key = '0xshdax_w4s_here'

app.register_blueprint(api)

def user_is_logged_in():
    return session.get('logged_in', False)

@app.route('/')
def login_page():
    if 'logged_in' in session and session['logged_in']:
        return redirect(url_for('dashboard'))
    return render_template('login/index.html')


@app.route('/backend/dashboard')
def dashboard():
    if not user_is_logged_in():
        return redirect(url_for('login_page'))
    return render_template('dashboard/index.html')


@app.route('/backend/inventory')
def reports():
    if not user_is_logged_in():
        return redirect(url_for('login_page'))
    return render_template('dashboard/inventory.html')


@app.route('/backend/setting')
def setting():
    if not user_is_logged_in():
        return redirect(url_for('login_page'))
    return render_template('dashboard/setting.html')

@app.route('/backend/admin/users-management')
def users_management():
    if not user_is_logged_in():
        return redirect(url_for('login_page'))
    return render_template('admin/users-management.html')

@app.route('/backend/admin/audit-logs')
def audit_logs():
    if not user_is_logged_in():
        return redirect(url_for('login_page'))
    return render_template('admin/audit-logs.html')


@app.route('/backend/logout')
def logout():
    session.clear()
    return redirect(url_for('login_page'))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)