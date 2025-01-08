from database import db_mongodb
from services.auth_services import create_user

def main():
    # Create a test user
    test_user = {
        "email": "test@example.com",
        "password": "test123"
    }
    
    result = create_user(test_user["email"], test_user["password"])
    if result:
        print(f"Test user created successfully with email: {test_user['email']}")
    else:
        print("User already exists")

if __name__ == "__main__":
    main()
