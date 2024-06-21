/**
 * 
 */
const urlinfo = new URLSearchParams(window.location.search);
const messageContainer = document.getElementById('message-container');

if (urlinfo.has('register') && urlinfo.get('register') === 'success') {
    const userId = urlinfo.get('userId');
    if (userId) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userId', userId);
        window.location.href = 'index.html';
    } else {
        messageContainer.textContent = 'Registration successful. Please log in.';
        messageContainer.style.color = 'green';
    }
} else if (urlinfo.has('error')) {
    const errorMessage = urlinfo.get('error');
    messageContainer.textContent = getErrorMessage(errorMessage);
    messageContainer.style.color = 'red';
}

document.querySelector('.signup-form form').addEventListener('submit', function(event) {
    event.preventDefault();
    const email = document.getElementById('signup-email').value;
    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;

    fetch('RegisterServlet', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `email=${encodeURIComponent(email)}&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&confirmpassword=${encodeURIComponent(confirmPassword)}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.isLoggedIn) {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userId', data.userId);
            window.location.href = 'index.html';
        } else {
            messageContainer.textContent = 'Registration failed. Please try again.';
            messageContainer.style.color = 'red';
        }
    })
    .catch(error => {
    console.error('Registration error:', error);
    if (error.message.includes('email-exists')) {
      messageContainer.textContent = 'An account with this email already exists.';
    } else if (error.message.includes('username-exists')) {
      messageContainer.textContent = 'Username is already taken.';
    } else {
      messageContainer.textContent = 'An error occurred during registration.';
    }
    messageContainer.style.color = 'red';
  });
});

function getErrorMessage(errorCode) {
  switch (errorCode) {
    case 'missing-fields':
      return 'Please fill in all the required fields.';
    case 'password-mismatch':
      return 'Passwords do not match.';
    case 'registration-failed':
      return 'Registration failed. Please try again.';
    case 'registration-error':
      return 'An error occurred during registration.';
    case 'invalid-credentials':
      return 'Invalid username or password.';
    case 'login-error':
      return 'An error occurred during login.';
    case 'email-exists':
      return 'An account with this email already exists.';
    case 'username-exists':
      return 'Username is already taken.';
    case 'login-missing-fields':
      return 'Please enter all fields.';
    default:
      return 'An unknown error occurred.';
  }
} 

function checkLoginStatus() {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  console.log(isLoggedIn);
  return isLoggedIn;
}

function updateNavigationLinks() {
  isLoggedIn = checkLoginStatus();
  const loginLink = document.getElementById('login-link');
  const portfolioLink = document.getElementById('portfolio-link');
  const logoutLink = document.getElementById('logout-link');

  if (isLoggedIn) {
	console.log("logged in");
    loginLink.style.display = 'none';
    console.log("hi");
    portfolioLink.style.display = 'inline';
    logoutLink.style.display = 'inline';
    console.log("hi");
  } else {
    loginLink.style.display = 'inline';
    portfolioLink.style.display = 'none';
    logoutLink.style.display = 'none';
  }
}

document.querySelector('.login-form form').addEventListener('submit', function(event) {
  event.preventDefault();

  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;

  fetch('LoginServlet', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
  })
    .then(response => response.json())
    .then(data => {
      if (data.isLoggedIn) {
		console.log(data.isLoggedIn);
		console.log("logged in");
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userId', data.userId);
        console.log('Stored userId:', data.userId);
        window.location.href = 'index.html';
      } else {
		console.log(data.isLoggedIn);
		console.log("not logged in");
        messageContainer.textContent = 'Invalid username or password.';
        messageContainer.style.color = 'red';
      }
    })
    .catch(error => {
    console.error('Login error:', error);
    if (error.message.includes('invalid-credentials')) {
      messageContainer.textContent = 'Invalid username or password.';
    } else if (error.message.includes('login-missing-fields')) {
      messageContainer.textContent = 'Please enter all fields.';
    } else {
      messageContainer.textContent = 'An error occurred during login.';
    }
    messageContainer.style.color = 'red';
  });
});

window.addEventListener('load', checkLoginStatus);