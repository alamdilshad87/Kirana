import { resetCustomerPassword } from "../services/customerAuthService";
import { showToast } from "../utils/toast";

export async function renderCustomerForgotPassword(container) {
  container.innerHTML = `
    <div class="auth-container">
      <div class="glass-card" style="max-width:400px;margin:auto;margin-top:120px;">
        <h2>Reset Password</h2>
        <p style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:20px;">
          Enter your registered phone number to set a new password.
        </p>

        <input id="reset-phone" placeholder="Phone Number" />
        <input id="reset-new-password" type="password" placeholder="New Password" />
        
        <button id="btn-reset" class="btn-primary" style="width:100%;margin-top:12px;">
          Update Password
        </button>

        <p style="text-align:center;margin-top:15px;">
          <a href="#customer-login" style="color:var(--primary);text-decoration:none;font-size:0.9rem;">Back to Login</a>
        </p>

        <div id="reset-error" style="color:#ef4444;margin-top:10px;"></div>
      </div>
    </div>
  `;

  document.getElementById("btn-reset").onclick = async () => {
    const phone = document.getElementById("reset-phone").value.trim();
    const newPassword = document.getElementById("reset-new-password").value.trim();
    const error = document.getElementById("reset-error");

    error.textContent = "";

    if (!phone || !newPassword) {
      error.textContent = "All fields required";
      return;
    }

    if (newPassword.length < 6) {
      error.textContent = "Password must be at least 6 characters";
      return;
    }

    const success = await resetCustomerPassword(phone, newPassword);

    if (success) {
      showToast("Password updated successfully!", "success");
      location.hash = "customer-login";
    } else {
      error.textContent = "Customer not found with this phone number";
    }
  };
}
