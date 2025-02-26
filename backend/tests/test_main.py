from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to Kobe AI API"}


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_read_items():
    response = client.get("/api/items")
    assert response.status_code == 200
    assert len(response.json()) > 0


def test_read_item():
    response = client.get("/api/items/1")
    assert response.status_code == 200
    assert response.json()["id"] == 1
