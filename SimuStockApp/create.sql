
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    balance DECIMAL(10, 2)
);

CREATE TABLE trades (
    trade_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    ticker VARCHAR(255) NOT NULL,
    num_stock INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    trade_type VARCHAR(10) NOT NULL,
    trade_timestamp TIMESTAMP NOT NULL,
    totalcost DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
