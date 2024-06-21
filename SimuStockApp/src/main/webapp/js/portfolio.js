/**
 * 
 */
const portfoliodata = {
    cashBalance: 0,
    totalAccountValue: 0,
    stocks: [
        
    ]
};

function fetchPortfolioData() {
    const userId = localStorage.getItem('userId');
    console.log('Fetching portfolio data for userId:', userId);

    if (userId) {
        fetch(`PortfolioServlet?userId=${userId}`)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Failed to retrieve portfolio data');
                }
            })
            .then(data => {
                const balance = data.balance;
                const portfolio = data.portfolio;
                console.log('Portfolio data received:', data);

                portfoliodata.cashBalance = balance;

                portfoliodata.stocks = [];

                if (portfolio.length === 0) {
                    portfoliodata.totalAccountValue = portfoliodata.cashBalance;
                    displayPortfolio();
                } else {
                    portfolio.forEach(stock => {
                        portfoliodata.stocks.push({
                            ticker: stock.ticker,
                            name: stock.name,
                            quantity: stock.totalStock,
                            avgCostPerShare: stock.avgPrice,
                            totalCost: stock.totalCost,
                            currentPrice: 0,
                            change: 0,
                            marketValue: 0,
                            tickerused: 0
                        });
                    });

                    console.log('Updated portfolio data:', portfoliodata);

                    const promises = portfoliodata.stocks.map(stock => {
                        return fetch(`https://finnhub.io/api/v1/quote?symbol=${stock.ticker}&token=${'cntl8u9r01qt3uhjcvfgcntl8u9r01qt3uhjcvg0'}`)
                            .then(response => response.json())
                            .then(data => {
                                stock.currentPrice = data.c;
                                stock.change = data.d;
                                stock.marketValue = stock.quantity * stock.currentPrice;
                                console.log('Updated stock data:', stock);
                            })
                            .catch(error => {
                                console.error('Error:', error);
                            });
                    });

                    Promise.all(promises)
                        .then(() => {
                            portfoliodata.totalAccountValue = portfoliodata.cashBalance + portfoliodata.stocks.reduce((total, stock) => total + stock.marketValue, 0);
                            console.log('Updated account data:', portfoliodata);
                            displayPortfolio();
                            console.log("hi 1");
                        })
                        .catch(error => {
                            console.error('Error:', error);
                        });
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    } else {
        console.error('User ID not found in localStorage');
    }
}

fetchPortfolioData();

function fetchCompanyName(ticker) {
  const companyProfileUrl = `https://finnhub.io/api/v1/stock/profile2?symbol=${ticker}&token=${'cntl8u9r01qt3uhjcvfgcntl8u9r01qt3uhjcvg0'}`;

  const xhr = new XMLHttpRequest();
  xhr.open('GET', companyProfileUrl, false);
  xhr.send();

  if (xhr.status === 200) {
    const data = JSON.parse(xhr.responseText);
    return data.name;
  } else {
    console.error('Error:', xhr.status);
    return '';
  }
}

function displayPortfolio() {
  const cashBalanceElement = document.getElementById('cash-balance');
  const totalAccountValueElement = document.getElementById('total-account-value');
  const portfolioStocksElement = document.getElementById('portfolio-section');

  cashBalanceElement.textContent = `$${portfoliodata.cashBalance.toFixed(2)}`;
  totalAccountValueElement.textContent = `$${portfoliodata.totalAccountValue.toFixed(2)}`;

  console.log('Displaying portfolio data');
  const existingStockCards = portfolioStocksElement.querySelectorAll('.stock-card');
  console.log(existingStockCards);
  existingStockCards.forEach(card => card.remove());
  console.log('Removed existing stock cards');
  console.log(existingStockCards);
  console.log(portfoliodata);

  console.log(portfoliodata.stocks.length);

  if (portfoliodata.stocks.length > 0) {
    portfoliodata.stocks.sort((a, b) => a.ticker.localeCompare(b.ticker));
    console.log(portfoliodata);

    portfoliodata.stocks.forEach(stock => {
      if (stock.quantity > 0 && stock.tickerused === 0) {
        console.log(stock.ticker);
        stock.tickerused = 1;
        const companyName = fetchCompanyName(stock.ticker);
        stock.name = companyName;

        fetch(`https://finnhub.io/api/v1/quote?symbol=${stock.ticker}&token=${'cntl8u9r01qt3uhjcvfgcntl8u9r01qt3uhjcvg0'}`)
          .then(response => response.json())
          .then(data => {
            stock.currentPrice = data.c;
            stock.change = data.d;
            stock.marketValue = stock.quantity * stock.currentPrice;

            console.log('Updated stock data:', stock);

            const stockCard = document.createElement('div');
            stockCard.classList.add('stock-card');
            
            let changeclass = '';
			let changeicon = '';
			
			if (stock.change >= 0) {
			  changeclass = 'positive';
			  changeicon = '<i class="fas fa-caret-up"></i>';
			} else {
			  changeclass = 'negative';
			  changeicon = '<i class="fas fa-caret-down"></i>';
            }
            
            stockCard.innerHTML = `
              <div class="stock-title">
                <h3>${stock.ticker} - ${stock.name}</h3>
              </div>
              <div class="stock-info">
                <div>
                  <p>Quantity: ${stock.quantity}</p>
                  <p>Avg. Cost/Share: ${(stock.totalCost / stock.quantity).toFixed(2)}</p>
                  <p>Total Cost: ${stock.totalCost.toFixed(2)}</p>
                </div>
                <div>
                  <p>Change: <span class="change-value ${changeclass}">${changeicon}${stock.change.toFixed(2)}</span></p>
                  <p class="${changeclass}">Current Price: ${stock.currentPrice.toFixed(2)}</p>
                  <p class="${changeclass}">Market Value: ${stock.marketValue.toFixed(2)}</p>
                </div>
              </div>
              <div class="stock-transaction">
                <form class="transaction-form">
                  <div class="quantity-input">
                    <label for="quantity">Quantity:</label>
                    <input type="number" id="quantity" placeholder="" class="quantity-input" />
                  </div>
                  <div class="radio-buttons">
                    <label><input type="radio" name="transactionType" value="buy" /> BUY</label>
                    <label><input type="radio" name="transactionType" value="sell" /> SELL</label>
                  </div>
                  <button type="submit" class="submit-btn">Submit</button>
                </form>
              </div>
            `;

            console.log('Created card for:', stock.ticker);

            const transactionForm = stockCard.querySelector('.transaction-form');
            const quantityInput = transactionForm.querySelector('.quantity-input input');
            const buyButton = transactionForm.querySelector('.submit-btn');

            buyButton.addEventListener('click', function(event) {
              event.preventDefault();
              const quantity = parseInt(quantityInput.value);
              const transactionType = transactionForm.querySelector('input[name="transactionType"]:checked');

              if (isNaN(quantity) || quantity <= 0) {
                alert('FAILED, transaction not possible');
                return;
              }

              if (!transactionType) {
                alert('Please select either the buy or sell option.');
                return;
              }

              const selectedTransactionType = transactionType.value;

              if (quantity > 0) {
                if (selectedTransactionType === 'buy') {
                  const userId = localStorage.getItem('userId');
                  console.log('Retrieved userId:', userId);
                  const cost = quantity * stock.currentPrice;
                  const tradeData = {
                    userId: userId,
                    ticker: stock.ticker,
                    numStock: quantity,
                    price: stock.currentPrice,
                    total: cost,
                    tradeType: 'buy'
                  };
                  console.log("hopefully works")

                  fetch('TradeServlet', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(tradeData)
                  })
                    .then(response => response.json())
                    .then(data => {
                      if (data.success) {
						console.log("trade done");
                        fetchPortfolioData();
                        alert(`Bought ${quantity} ${stock.ticker} stock(s)`);
                      } else {
                        alert('FAILED: Purchase not possible. ' + data.message);
                      }
                    })
                    .catch(error => {
                      console.error('Error:', error);
                      alert('An error occurred. Please try again later.');
                    });
                } else if (selectedTransactionType === 'sell') {
                  if (quantity <= stock.quantity) {
                    const userId = localStorage.getItem('userId');
                    const totalsold = quantity * stock.currentPrice;
                    const tradeData = {
                      userId: userId,
                      ticker: stock.ticker,
                      numStock: quantity,
                      price: stock.currentPrice,
                      total: totalsold,
                      tradeType: 'sell'
                    };

                    fetch('TradeServlet', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify(tradeData)
                    })
                      .then(response => response.json())
                      .then(data => {
                        if (data.success) {
                          fetchPortfolioData();
                          alert(`Sold ${quantity} ${stock.ticker} stock(s)`);
                        } else {
                          alert('FAILED: Sale not possible. ' + data.message);
                        }
                      })
                      .catch(error => {
                        console.error('Error:', error);
                        alert('An error occurred. Please try again later.');
                      });
                  } else {
                    alert('FAILED: Insufficient shares to sell.');
                  }
                }
              } else {
                alert('Please enter a valid quantity');
              }
            });

            portfolioStocksElement.appendChild(stockCard);
          })
          .catch(error => {
            console.error('Error:', error);
          });
      }
    });
  } else {
    alert('You have nothing in your portfolio.');
  }
}

checkLoginStatus();

function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
        window.location.href = 'login.html';
    } 
}

document.addEventListener('DOMContentLoaded', function() {
    console.log("hi");
    setupLogoutListener();
});

function setupLogoutListener() {
    var logoutLink = document.getElementById('logout-link2');
    console.log("hi2");
    if (logoutLink) {
        logoutLink.addEventListener('click', function(event) {
            console.log("hi3");
            event.preventDefault();
            localStorage.removeItem('isLoggedIn');
        });
    } else {
        console.error("Logout link not found");
    }
}

var loglink = document.getElementById("logout-link2");

loglink.addEventListener("click", function() {
    window.location.href = 'index.html';
    console.log("Clicked!");
});