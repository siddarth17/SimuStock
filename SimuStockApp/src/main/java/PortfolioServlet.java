import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Servlet implementation class PortfolioServlet
 */
@WebServlet("/PortfolioServlet")
public class PortfolioServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public PortfolioServlet() {
        super();
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String userids = request.getParameter("userId");

        if (userids == null || userids.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write("{\"error\": \"User ID is missing\"}");
            return;
        }

        int userId = Integer.parseInt(userids);

        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            Connection conn = DriverManager.getConnection("jdbc:mysql://localhost/joesstocks?user=root&password=Mawile.17032004");

            String balanceselect = "SELECT balance FROM users WHERE user_id = ?";
            PreparedStatement balanceset = conn.prepareStatement(balanceselect);
            balanceset.setInt(1, userId);
            ResultSet balanceResult = balanceset.executeQuery();

            if (balanceResult.next()) {
                double balance = balanceResult.getDouble("balance");

                String portfolioquery = "SELECT ticker, SUM(num_stock) AS total_stock, AVG(price) AS avg_price, SUM(totalcost) AS totalcost " +
                        "FROM trades WHERE user_id = ? " +
                        "GROUP BY ticker";
                PreparedStatement portfoliostmt = conn.prepareStatement(portfolioquery);
                portfoliostmt.setInt(1, userId);
                ResultSet portfolioResult = portfoliostmt.executeQuery();

                JsonArray portfolioArray = new JsonArray();
                while (portfolioResult.next()) {
                    String ticker = portfolioResult.getString("ticker");
                    int totalStock = portfolioResult.getInt("total_stock");
                    double avgPrice = portfolioResult.getDouble("avg_price");
                    double totalCost = portfolioResult.getDouble("totalcost");
                    JsonObject stockObject = new JsonObject();
                    stockObject.addProperty("ticker", ticker);
                    stockObject.addProperty("totalStock", totalStock);
                    stockObject.addProperty("avgPrice", avgPrice);
                    stockObject.addProperty("totalCost", totalCost);

                    portfolioArray.add(stockObject);
                }

                JsonObject responseObject = new JsonObject();
                responseObject.addProperty("balance", balance);
                responseObject.add("portfolio", portfolioArray);

                response.setContentType("application/json");
                response.setCharacterEncoding("UTF-8");
                response.getWriter().write(new Gson().toJson(responseObject));
            } else {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                response.setContentType("application/json");
                response.setCharacterEncoding("UTF-8");
                response.getWriter().write("{\"error\": \"User not found\"}");
            }
        } catch (ClassNotFoundException | SQLException e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write("{\"error\": \"An error occurred while retrieving the portfolio data\"}");
        }
    }

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		doGet(request, response);
	}

}
