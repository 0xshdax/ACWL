document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/v2/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            window.location.href = "/backend/dashboard";
        } else {
            document.getElementById('error-message').textContent = data.message || 'Login failed';
            document.getElementById('error-message').style.display = 'block';
        }
    } catch (error) {
        console.error('Error during login:', error);
        document.getElementById('error-message').textContent = 'An error occurred. Please try again.';
        document.getElementById('error-message').style.display = 'block';
    }
});

document.getElementById('registrationForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const firstName = document.getElementById('first-name').value;
    const lastName = document.getElementById('last-name').value;
    const email = document.getElementById('registration-email').value;
    const password = document.getElementById('registration-password').value;

    try {
        const response = await fetch('/api/v2/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ firstName, lastName, email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            window.location.href = "/login";
        } else {
            document.getElementById('registration-error-message').textContent = data.message || 'Registration failed';
            document.getElementById('registration-error-message').style.display = 'block';
        }
    } catch (error) {
        console.error('Error during registration:', error);
        document.getElementById('registration-error-message').textContent = 'An error occurred. Please try again.';
        document.getElementById('registration-error-message').style.display = 'block';
    }
});

