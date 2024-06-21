import java.io.BufferedReader;
import java.io.IOException;
import java.sql.Timestamp;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import com.google.gson.Gson;
import com.google.gson.JsonObject;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Servlet implementation class TradeServlet
 */
@WebServlet("/TradeServlet")
public class TradeServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public TradeServlet() {
        super();
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		response.getWriter().append("Served at: ").append(request.getContextPath());
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
		StringBuilder sb = new StringBuilder();
	    BufferedReader reader = request.getReader();
	    String line;
	    while ((line = reader.readLine()) != null) {
	        sb.append(line);
	    }
	    String requestline = sb.toString();

	    JsonObject jsonObject = new Gson().fromJson(requestline, JsonObject.class);

	    int userid = jsonObject.get("userId").getAsInt();
        String ticker = jsonObject.get("ticker").getAsString();
        int quantity = jsonObject.get("numStock").getAsInt();
        double price = jsonObject.get("price").getAsDouble();
        String tradetype = jsonObject.get("tradeType").getAsString();

        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            Connection conn = DriverManager.getConnection("jdbc:mysql://localhost/joesstocks?user=root&password=Mawile.17032004");

            if (tradetype.equals("buy")) {
                String checkBalanceQuery = "SELECT balance FROM users WHERE user_id = ?";
                PreparedStatement checkBalanceStmt = conn.prepareStatement(checkBalanceQuery);
                checkBalanceStmt.setInt(1, userid);
                ResultSet balanceResult = checkBalanceStmt.executeQuery();
                balanceResult.next();
                double balance = balanceResult.getDouble("balance");

                double totalCost = jsonObject.get("total").getAsDouble();
                System.out.println(totalCost);
                if (balance >= totalCost) {               	               	
                    String updateBalanceQuery = "UPDATE users SET balance = balance - ? WHERE user_id = ?";
                    PreparedStatement updateBalanceStmt = conn.prepareStatement(updateBalanceQuery);
                    updateBalanceStmt.setDouble(1, totalCost);
                    updateBalanceStmt.setInt(2, userid);
                    updateBalanceStmt.executeUpdate();

                    String insertTradeQuery = "INSERT INTO trades (user_id, ticker, num_stock, price, trade_type, trade_timestamp, totalcost) VALUES (?, ?, ?, ?, ?, ?, ?)";
                    PreparedStatement insertTradeStmt = conn.prepareStatement(insertTradeQuery);
                    insertTradeStmt.setInt(1, userid);
                    insertTradeStmt.setString(2, ticker);
                    insertTradeStmt.setInt(3, quantity);
                    insertTradeStmt.setDouble(4, price);
                    insertTradeStmt.setString(5, tradetype);
                    insertTradeStmt.setTimestamp(6, new Timestamp(System.currentTimeMillis()));
                    insertTradeStmt.setDouble(7, totalCost);
                    insertTradeStmt.executeUpdate();

                    response.setStatus(HttpServletResponse.SC_OK);
                    response.setContentType("application/json");
                    response.setCharacterEncoding("UTF-8");
                    response.getWriter().write("{\"success\": true, \"message\": \"Trade executed successfully\"}");
                } else {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    response.getWriter().write("Insufficient balance.");
                }
            } else if (tradetype.equals("sell")) {
                String checkstockquery = "SELECT SUM(num_stock) AS total_stock, SUM(totalcost) AS total_cost FROM trades WHERE user_id = ? AND ticker = ?";
                PreparedStatement checkstock = conn.prepareStatement(checkstockquery);
                checkstock.setInt(1, userid);
                checkstock.setString(2, ticker);
                ResultSet stockResult = checkstock.executeQuery();
                stockResult.next();
                int totalStock = stockResult.getInt("total_stock");
                double totalsold = jsonObject.get("total").getAsDouble();
                
                if (totalStock >= quantity) {
                    String updatebalancequery = "UPDATE users SET balance = balance + ? WHERE user_id = ?";
                    PreparedStatement updatebalance = conn.prepareStatement(updatebalancequery);
                    updatebalance.setDouble(1, totalsold);
                    updatebalance.setInt(2, userid);
                    updatebalance.executeUpdate();

                    String inserttradequery = "INSERT INTO trades (user_id, ticker, num_stock, price, trade_type, trade_timestamp, totalcost) VALUES (?, ?, ?, ?, ?, ?, ?)";
                    PreparedStatement inserttrade = conn.prepareStatement(inserttradequery);
                    inserttrade.setInt(1, userid);
                    inserttrade.setString(2, ticker);
                    inserttrade.setInt(3, -quantity);
                    inserttrade.setDouble(4, price);
                    inserttrade.setString(5, tradetype);
                    inserttrade.setTimestamp(6, new Timestamp(System.currentTimeMillis()));
                    inserttrade.setDouble(7, -totalsold);
                    inserttrade.executeUpdate();

                    response.setStatus(HttpServletResponse.SC_OK);
                    response.setContentType("application/json");
                    response.setCharacterEncoding("UTF-8");
                    response.getWriter().write("{\"success\": true, \"message\": \"Trade executed successfully\"}");
                } else {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    response.setContentType("application/json");
                    response.setCharacterEncoding("UTF-8");
                    response.getWriter().write("{\"success\": false, \"message\": \"Insufficient stocks to sell\"}");
                }
            }
        } catch (ClassNotFoundException | SQLException e) {
        	e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write("{\"success\": false, \"message\": \"An error occurred while executing the trade\"}");
        }
    }

}
