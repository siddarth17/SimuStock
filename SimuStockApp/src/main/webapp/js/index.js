/**
 * 
 */
function displayCompanyDetails(ticker) {
  const companyProfileUrl = `https://finnhub.io/api/v1/stock/profile2?symbol=${ticker}&token=${'cntl8u9r01qt3uhjcvfgcntl8u9r01qt3uhjcvg0'}`;
  const companyQuoteUrl = `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${'cntl8u9r01qt3uhjcvfgcntl8u9r01qt3uhjcvg0'}`;

  Promise.all([fetch(companyProfileUrl), fetch(companyQuoteUrl)])
    .then(responses => Promise.all(responses.map(response => response.json())))
    .then(([companyProfile, companyQuote]) => {
      if (companyProfile && companyQuote) {
        const company = {
          symbol: companyProfile.ticker,
          name: companyProfile.name,
          exchange: companyProfile.exchange,
          price: parseFloat(companyQuote.c).toFixed(2),
          change: parseFloat(companyQuote.d).toFixed(2),
          changePercent: parseFloat(companyQuote.dp).toFixed(2),
          time: formatDate(new Date()),
          isMarketOpen: isMarketOpen(),
          high: companyQuote.h,
          low: companyQuote.l,
          open: companyQuote.o,
          close: companyQuote.pc,
          ipo: companyProfile.ipo,
          marketCap: companyProfile.marketCapitalization,
          shareOutstanding: companyProfile.shareOutstanding,
          website: companyProfile.weburl,
          phone: companyProfile.phone
        };

        let mainContent = document.getElementById('main-content');
        const isLoggedIn = isUserLoggedIn();

        let companyDetails = `
          <section id="companydetails" class="${isLoggedIn ? 'logged-in' : ''}">
            <div class="details">
              <div class="header-left">
                <h2>${company.symbol}</h2>
                <h3>${company.name}</h3>
                <p>${company.exchange}</p>
                ${isLoggedIn ? `
                  <div class="buysection">
                    <div class="quantity">
                      <label for="quantity">Quantity:</label>
                      <input type="number" id="quantity" placeholder="">
                    </div>
                    <button id="buybutton">BUY</button>
                  </div>
                ` : ''}
              </div>
              ${isLoggedIn ? `
              <div class="header-right ${company.change >= 0 ? 'positive' : 'negative'}">
                <p>
                  <div id="companyprice">$${company.price}</div>
                  <div id="companychange">
                    ${company.change >= 0 ? '<i class="fas fa-caret-up"></i>' : '<i class="fas fa-caret-down"></i>'}
                    ${company.change} (${company.changePercent}%)
                  </div>
                </p>
                <p id="companytime">${company.time}</p>
              </div>
            </div>
            <div class="status">
              <p id="status">${company.isMarketOpen ? 'Market is Open' : 'Market is Closed'}</p>
            </div>
            ` : ''}
            <section id="summary" class="${isLoggedIn ? 'logged-in' : ''}">
              <h4>Summary</h4>
              <p>High Price: ${company.high}</p>
              <p>Low Price: ${company.low}</p>
              <p>Open Price: ${company.open}</p>
              <p>Close Price: ${company.close}</p>
              <p></p>
            </section>
            <div class="companyinfo">
              <h4>Company Information</h4>
              <p><strong>IPO Date</strong>: ${company.ipo}</p>
              <p><strong>Market Cap ($M)</strong>: ${company.marketCap}</p>
              <p><strong>Share Outstanding</strong>: ${company.shareOutstanding}</p>
              <p><strong>Website</strong>: <a href="${company.website}" target="_blank">${company.website}</a></p>
              <p><strong>Phone</strong>: ${company.phone}</p>
            </div>
          </section>
        `;

        mainContent.innerHTML = companyDetails;

        if (isLoggedIn) {
          document.getElementById('buybutton').addEventListener('click', function() {
			const quantity = parseInt(document.getElementById('quantity').value);
	        if (quantity > 0) {
				fetch(`https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${'cntl8u9r01qt3uhjcvfgcntl8u9r01qt3uhjcvg0'}`)
		          .then(response => response.json())
		          .then(data => {
		            const currentPrice = data.c;
		            const totalCost = quantity * currentPrice;
		
		            const userId = localStorage.getItem('userId'); 
		            console.log(userId);
		
		            fetch('TradeServlet', {
		              method: 'POST',
		              headers: {
		                'Content-Type': 'application/json'
		              },
		              body: JSON.stringify({
					    userId: userId,
					    ticker: ticker,
					    numStock: quantity,
					    price: currentPrice,
					    tradeType: 'buy',
					    total: totalCost.toFixed(2)
					  })
		            })
		              .then(response => response.json())
		              .then(data => {
		                if (data.success) {
		                  alert(`Bought ${quantity} shares of ${ticker} for $${totalCost.toFixed(2)}`);
		                } else {
		                  alert('FAILED: Purchase not possible. ' + data.message);
		                }
		              })
		              .catch(error => {
		                console.error('Error:', error);
		                alert('An error occurred. Please try again later.');
		              });
		          })
		          .catch(error => {
		            console.error('Error:', error);
		            alert('An error occurred. Please try again later.');
		          });
				        
			} else {
				alert('FAILED: Purchase not possible');
			}
		 });
        }
      } else {
        alert('Ticker not found. Please try again.');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('An error occurred. Please try again later.');
    });
}

function formatDate(date) {
  const stockdate = num => num.toString().padStart(2, '0');
  return `${stockdate(date.getMonth() + 1)}-${stockdate(date.getDate())}-${date.getFullYear()} ${stockdate(date.getHours())}:${stockdate(date.getMinutes())}:${stockdate(date.getSeconds())}`;
}


function isMarketOpen() {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();
  if (day >= 1 && day <= 5) { 
    if (hour >= 6 && hour < 13) {
      return true;
    } 
  }

  return false;
}

function displaySearchSection() {
  let mainContent = document.getElementById('main-content');
  
  mainContent.innerHTML = `
    <section id="search-section">
      <h1>SEARCH STOCKS</h1>
      <div class="search-bar">
        <input type="text" id="search-input" placeholder="Search by ticker..." />
        <button id="search-button"><i class="fas fa-search"></i></button>
      </div>
    </section>
  `;
  
  bindSearchButtonEventListener();
}

function bindSearchButtonEventListener() {
  document.getElementById('search-button').addEventListener('click', function() {
    let ticker = document.getElementById('search-input').value.trim().toUpperCase();
    displayCompanyDetails(ticker);
  });
}

document.getElementById('homelink').addEventListener('click', function(event) {
  event.preventDefault();
  displaySearchSection();
});

document.getElementById('loginlink').addEventListener('click', function(event) {
  event.preventDefault();
  window.location.href = 'login.html';
});


function isUserLoggedIn() {
  console.log(localStorage.getItem('isLoggedIn') === 'true');
  return localStorage.getItem('isLoggedIn') === 'true';
}

function updateNavigationLinks() {
  isLoggedIn = isUserLoggedIn();
  const loginLink = document.getElementById('loginlink');
  const portfolioLink = document.getElementById('portfoliolink');
  const logoutLink = document.getElementById('logoutlink');
  console.log(isLoggedIn);
  if (isLoggedIn) {
	console.log("this is logged in");
    loginLink.style.display = 'none';
    portfolioLink.style.display = 'inline';
    logoutLink.style.display = 'inline';
  } else {
	console.log("this is logged out");
    loginLink.style.display = 'inline';
    portfolioLink.style.display = 'none';
    logoutLink.style.display = 'none';
  }
}

function checkLoginStatus() {
  const isLoggedIn = isUserLoggedIn();
  updateNavigationLinks();
}

document.getElementById('logoutlink').addEventListener('click', function(event) {
  event.preventDefault();
  localStorage.removeItem('isLoggedIn');
  updateNavigationLinks();
  window.location.href = 'index.html';
});

displaySearchSection();
checkLoginStatus();