import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Servlet implementation class RegisterServlet
 */
@WebServlet("/RegisterServlet")
public class RegisterServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public RegisterServlet() {
        super();
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        request.getRequestDispatcher("login.html").forward(request, response);
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String username = request.getParameter("username");
        String password = request.getParameter("password");
        String email = request.getParameter("email");
        String confirmPassword = request.getParameter("confirmpassword");

        if (username == null || username.isEmpty() || password == null || password.isEmpty() ||
                email == null || email.isEmpty() || confirmPassword == null || confirmPassword.isEmpty()) {
            response.sendRedirect("login.html?error=missing-fields");
            return;
        }

        if (!password.equals(confirmPassword)) {
            response.sendRedirect("login.html?error=password-mismatch");
            return;
        }
        
        Connection conn = null;
        PreparedStatement checkuser = null;
        PreparedStatement insertuser = null;

        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            conn = DriverManager.getConnection("jdbc:mysql://localhost/joesstocks?", "root", "Mawile.17032004");
            String checkQuery = "SELECT COUNT(*) FROM users WHERE username = ? OR email = ?";
            checkuser = conn.prepareStatement(checkQuery);
            checkuser.setString(1, username);
            checkuser.setString(2, email);

            ResultSet validateset = checkuser.executeQuery();
            
            if (validateset.next() && validateset.getInt(1) > 0) {
            	if (validateset.getInt(1) == 1) {
                    response.sendRedirect("login.html?error=email-exists");
                } else {
                    response.sendRedirect("login.html?error=username-exists");
                }
                return;
            }
            
            String query = "INSERT INTO users (username, password, email, balance) VALUES (?, ?, ?, ?)";
            insertuser = conn.prepareStatement(query);
            insertuser.setString(1, username);
            insertuser.setString(2, password);
            insertuser.setString(3, email);
            insertuser.setDouble(4, 50000.00); 
            int rows= insertuser.executeUpdate();

            if (rows > 0) {
                String selectusers = "SELECT user_id FROM users WHERE username = ?";
                PreparedStatement selectuser = conn.prepareStatement(selectusers);
                selectuser.setString(1, username);
                ResultSet userresult = selectuser.executeQuery();

                if (userresult.next()) {
                    int userId = userresult.getInt("user_id");
                    response.setContentType("application/json");
                    response.setCharacterEncoding("UTF-8");
                    response.getWriter().write("{\"isLoggedIn\": true, \"userId\": \"" + userId + "\"}");
                    
                } else {
                    response.sendRedirect("login.html?error=user-not-found");
                }
            } else {
                response.sendRedirect("login.html?error=registration-failed");
            }
        } catch (ClassNotFoundException | SQLException e) {
            e.printStackTrace();
            response.sendRedirect("login.html?error=registration-error");
        } finally {
            try {
                if (checkuser != null) checkuser.close();
                if (insertuser != null) insertuser.close();
                if (conn != null) conn.close();
            } catch (SQLException ex) {
                ex.printStackTrace();
            }
        }
    }
}

