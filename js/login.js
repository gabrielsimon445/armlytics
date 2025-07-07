document.addEventListener('DOMContentLoaded', function () {
  function togglePassword() {
    const campo = document.getElementById('password');
    const icone = document.getElementById('iconPassword');

    if (campo.type === 'password') {
      campo.type = 'text';
      icone.classList.remove('fa-eye');
      icone.classList.add('fa-eye-slash');
    } else {
      campo.type = 'password';
      icone.classList.remove('fa-eye-slash');
      icone.classList.add('fa-eye');
    }
  }

  function login() {
    window.location.href = "../html/periodization-list.html";
  }

  // associar eventos via JS (mais moderno)
  document.getElementById('togglePassword').addEventListener('click', togglePassword);
  document.getElementById('entrar').addEventListener('click', login);
});