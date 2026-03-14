import os
import httpx
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

security = HTTPBearer()


async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify Supabase JWT token and return user info."""
    token = credentials.credentials
    jwt_secret = os.getenv("SUPABASE_JWT_SECRET")

    # 1) Try local verification with JWT secret (HS256)
    if jwt_secret and jwt_secret != "your-jwt-secret":
        try:
            payload = jwt.decode(
                token,
                jwt_secret,
                algorithms=["HS256"],
                audience="authenticated",
            )
            return {
                "sub": payload.get("sub") or payload.get("id"),
                "email": payload.get("email"),
                "user_metadata": payload.get("user_metadata", {}),
            }
        except JWTError:
            # Fall through to remote verification
            pass

    # 2) Fallback: ask Supabase to validate the token via /auth/v1/user
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{SUPABASE_URL}/auth/v1/user",
            headers={
                "Authorization": f"Bearer {token}",
                "apikey": SUPABASE_ANON_KEY,
            },
        )

    if resp.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    payload = resp.json()
    return {
        "sub": payload.get("sub") or payload.get("id"),
        "email": payload.get("email"),
        "user_metadata": payload.get("user_metadata", {}),
    }
