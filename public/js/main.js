// ============================================================
// TOKOBUKU - Main JavaScript
// ============================================================

document.addEventListener('DOMContentLoaded', function () {

    // Auto-dismiss flash alerts setelah 4 detik
    const alerts = document.querySelectorAll('.alert.alert-dismissible');
    alerts.forEach(alert => {
        setTimeout(() => {
            const bsAlert = bootstrap.Alert.getOrCreateInstance(alert);
            bsAlert.close();
        }, 4000);
    });

    // Konfirmasi hapus dengan atribut data-confirm
    document.querySelectorAll('[data-confirm]').forEach(el => {
        el.addEventListener('click', function (e) {
            if (!confirm(this.dataset.confirm)) e.preventDefault();
        });
    });

    // Preview gambar sebelum upload
    const imageInputs = document.querySelectorAll('input[type="file"][data-preview]');
    imageInputs.forEach(input => {
        input.addEventListener('change', function () {
            const previewId = this.dataset.preview;
            const preview = document.getElementById(previewId);
            if (preview && this.files[0]) {
                const reader = new FileReader();
                reader.onload = e => preview.src = e.target.result;
                reader.readAsDataURL(this.files[0]);
            }
        });
    });

    // Tombol toggle password
    document.querySelectorAll('[data-toggle-password]').forEach(btn => {
        btn.addEventListener('click', function () {
            const targetId = this.dataset.togglePassword;
            const input = document.getElementById(targetId);
            const icon = this.querySelector('i');
            if (input) {
                if (input.type === 'password') {
                    input.type = 'text';
                    if (icon) icon.className = 'bi bi-eye-slash';
                } else {
                    input.type = 'password';
                    if (icon) icon.className = 'bi bi-eye';
                }
            }
        });
    });

    // Active nav link highlight berdasarkan URL
    const currentPath = window.location.pathname;
    document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
        if (link.href && link.href !== '#') {
            const url = new URL(link.href);
            if (url.pathname === currentPath) {
                link.classList.add('active');
            }
        }
    });
});
