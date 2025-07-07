function toggleDarkMode() {
    const body = document.body;
    const icon = document.getElementById('theme-icon');

    body.classList.toggle("dark-mode");

    const isDark = body.classList.contains("dark-mode");
    localStorage.setItem("theme", isDark ? "dark" : "light");

    icon.classList = isDark ? "fas fa-moon" : "fas fa-sun";
}

window.onload = function () {
    const savedTheme = localStorage.getItem("theme");
    const body = document.body;
    const icon = document.getElementById('theme-icon');

    if (savedTheme === "dark") {
        body.classList.add("dark-mode");
        icon.classList = "fas fa-moon";
    } else {
        icon.classList = "fas fa-sun";
    }
};