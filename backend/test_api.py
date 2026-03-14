import httpx
import uuid
import sys

BASE_URL = "http://localhost:8000/api/v1"

def test_api():
    print("Starting backend tests...")
    
    # Generate a random email to avoid conflicts
    unique_email = f"test_{uuid.uuid4().hex[:6]}@example.com"
    password = "securepassword123"
    
    # 1. Test Signup
    print(f"\n[1] Testing Signup for {unique_email}...")
    try:
        r = httpx.post(f"{BASE_URL}/auth/signup", json={
            "full_name": "Test User",
            "email": unique_email,
            "password": password
        })
        assert r.status_code == 200, f"Signup failed: {r.text}"
        user_data = r.json()
        print(f"✅ Signup successful: {user_data['full_name']} (ID: {user_data['id']})")
    except Exception as e:
        print(f"❌ Signup test failed: {e}")
        sys.exit(1)

    # 2. Test Login
    print("\n[2] Testing Login...")
    try:
        r = httpx.post(f"{BASE_URL}/auth/login", json={
            "email": unique_email,
            "password": password
        })
        assert r.status_code == 200, f"Login failed: {r.text}"
        token_data = r.json()
        token = token_data["access_token"]
        print(f"✅ Login successful, obtained token.")
    except Exception as e:
        print(f"❌ Login test failed: {e}")
        sys.exit(1)

    headers = {"Authorization": f"Bearer {token}"}

    # 3. Test /me
    print("\n[3] Testing /auth/me...")
    try:
        r = httpx.get(f"{BASE_URL}/auth/me", headers=headers)
        assert r.status_code == 200, f"Me failed: {r.text}"
        me_data = r.json()
        print(f"✅ /me successful. User: {me_data['email']}")
    except Exception as e:
        print(f"❌ /me test failed: {e}")
        sys.exit(1)

    # 4. Test Categories
    print("\n[4] Testing Category Creation...")
    try:
        cat_name = f"Test Category {uuid.uuid4().hex[:4]}"
        r = httpx.post(f"{BASE_URL}/categories", headers=headers, json={
            "name": cat_name,
            "description": "A test category"
        })
        assert r.status_code == 200, f"Category creation failed: {r.text}"
        cat_data = r.json()
        cat_id = cat_data["id"]
        print(f"✅ Category created: {cat_data['name']} (ID: {cat_id})")
    except Exception as e:
        print(f"❌ Category test failed: {e}")
        sys.exit(1)

    # 5. Test Products
    print("\n[5] Testing Product Creation...")
    try:
        sku = f"TST-{uuid.uuid4().hex[:6].upper()}"
        r = httpx.post(f"{BASE_URL}/products", headers=headers, json={
            "name": "Test Product",
            "sku": sku,
            "category_id": cat_id,
            "unit_of_measure": "kg"
        })
        assert r.status_code == 200, f"Product creation failed: {r.text}"
        prod_data = r.json()
        print(f"✅ Product created: {prod_data['name']} (SKU: {prod_data['sku']}, ID: {prod_data['id']})")
    except Exception as e:
        print(f"❌ Product test failed: {e}")
        sys.exit(1)
        
    print("\n🎉 All backend tests passed successfully!")

if __name__ == "__main__":
    test_api()
