
function resetPassword() {
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("password-confirm").value;

    if (password !== confirmPassword) {

        document.getElementById("password").value = "";
        document.getElementById("password-confirm").value = "";
        // Notify the user
        alert("Passwords do not match. Please try again.");
        return;
    }


    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');


    axios.post('http://localhost:3000/users/reset-password', {
        token: token,
        password: password,
        confirmPassword: confirmPassword
    })
        .then(response => {
            console.log(response.data);
            alert("Password reset successful!");
            window.location.href = "/login";
        })
        .catch(error => {
            console.error(error);
            alert("An error occurred. Please try again.");
        });
}
