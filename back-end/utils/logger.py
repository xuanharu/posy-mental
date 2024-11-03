import logging

def setup_logger(name='my_logger', log_file='app.log', level=logging.DEBUG):
    """Setup a logger that logs to both the terminal and a file."""
    
    # Create a custom logger
    logger = logging.getLogger(name)
    logger.setLevel(level)

    # Create handlers
    c_handler = logging.StreamHandler()  # Console handler
    f_handler = logging.FileHandler(log_file)  # File handler
    c_handler.setLevel(level)
    f_handler.setLevel(level)

    # Create formatters and add them to the handlers
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    c_handler.setFormatter(formatter)
    f_handler.setFormatter(formatter)

    # Add the handlers to the logger
    logger.addHandler(c_handler)
    logger.addHandler(f_handler)
    
    return logger

# Example usage
logger = setup_logger()
