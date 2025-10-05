from locust import HttpUser, task, between

class WebsiteUser(HttpUser):
    wait_time = between(1, 5)

    @task(2)
    def load_homepage(self):
        self.client.get("/")

    @task(1)
    def load_newsfeed(self):
        self.client.get("/newsfeed.html")

    @task(1)
    def load_chat(self):
        self.client.get("/chat.html")

    @task(1)
    def load_login(self):
        self.client.get("/login.html")

    @task(1)
    def load_register(self):
        self.client.get("/register.html")

    @task(1)
    def load_advice(self):
        self.client.get("/advice.html")
