# Recommended Authentication Fixes

This document provides concrete code examples for fixing the identified authentication issues.

## Fix 1: Implement Logout Endpoint (CRITICAL)

### Option A: Token Blacklist with Redis (Recommended)

```python
# Install: pip install redis aioredis

import aioredis
from datetime import timedelta

# In main.py, add Redis connection
redis = None

@app.on_event("startup")
async def startup_event():
    global redis
    redis = await aioredis.create_redis_pool('redis://localhost')

@app.on_event("shutdown")
async def shutdown_event():
    redis.close()
    await redis.wait_closed()

# Add token blacklist helper functions
async def blacklist_token(token: str, expires_in_hours: int = 24):
    """Add token to blacklist"""
    await redis.setex(
        f"blacklist:{token}",
        timedelta(hours=expires_in_hours),
        "1"
    )

async def is_token_blacklisted(token: str) -> bool:
    """Check if token is blacklisted"""
    return await redis.exists(f"blacklist:{token}")

# Update get_current_user to check blacklist
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """Get current authenticated user from JWT token"""
    try:
        token = credentials.credentials

        # Check if token is blacklisted
        if await is_token_blacklisted(token):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has been revoked",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # ... rest of token validation code ...

    except jwt.ExpiredSignatureError:
        # ... handle expired token ...

# Add logout endpoint
@app.post("/api/auth/logout")
async def logout(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Logout user and invalidate token"""
    try:
        token = credentials.credentials

        # Decode to get expiration
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        exp = payload.get("exp")

        # Calculate remaining time until expiration
        import time
        remaining_seconds = exp - int(time.time())
        remaining_hours = max(1, remaining_seconds // 3600)

        # Add to blacklist
        await blacklist_token(token, expires_in_hours=remaining_hours)

        return {
            "success": True,
            "message": "Logged out successfully"
        }

    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    except Exception as e:
        print(f"Logout error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Logout failed"
        )
```

### Option B: Database Token Blacklist (No Redis)

```python
# In database_async.py, add table
async def init_database(self):
    # ... existing tables ...

    await conn.execute('''
        CREATE TABLE IF NOT EXISTS token_blacklist (
            token VARCHAR(500) PRIMARY KEY,
            blacklisted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP NOT NULL
        )
    ''')

# Add methods
async def blacklist_token(self, token: str, expires_at: datetime):
    """Add token to blacklist"""
    async with aiosqlite.connect(self.db_path) as conn:
        await conn.execute(
            'INSERT INTO token_blacklist (token, expires_at) VALUES (?, ?)',
            (token, expires_at)
        )
        await conn.commit()

async def is_token_blacklisted(self, token: str) -> bool:
    """Check if token is blacklisted"""
    async with aiosqlite.connect(self.db_path) as conn:
        cursor = await conn.execute(
            'SELECT 1 FROM token_blacklist WHERE token = ? AND expires_at > CURRENT_TIMESTAMP',
            (token,)
        )
        result = await cursor.fetchone()
        return result is not None

async def cleanup_expired_tokens(self):
    """Remove expired tokens from blacklist"""
    async with aiosqlite.connect(self.db_path) as conn:
        await conn.execute('DELETE FROM token_blacklist WHERE expires_at < CURRENT_TIMESTAMP')
        await conn.commit()

# In main.py
@app.post("/api/auth/logout")
async def logout(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Logout user and invalidate token"""
    try:
        token = credentials.credentials

        # Decode to get expiration
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        exp_timestamp = payload.get("exp")
        expires_at = datetime.fromtimestamp(exp_timestamp)

        # Add to blacklist
        await db.blacklist_token(token, expires_at)

        return {
            "success": True,
            "message": "Logged out successfully"
        }

    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

# Update get_current_user
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials

        # Check blacklist
        if await db.is_token_blacklisted(token):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has been revoked"
            )

        # ... rest of validation ...
```

---

## Fix 2: Fix HTTP Status Codes (403 → 401)

```python
# In main.py, update security configuration

# Replace this:
security = HTTPBearer()
security_optional = HTTPBearer(auto_error=False)

# With this:
from fastapi.security import HTTPBearer as _HTTPBearer

class CustomHTTPBearer(_HTTPBearer):
    """Custom HTTPBearer that returns 401 instead of 403"""

    async def __call__(self, request):
        from fastapi import Request
        from starlette.status import HTTP_401_UNAUTHORIZED

        try:
            return await super().__call__(request)
        except HTTPException as e:
            # Convert 403 to 401
            if e.status_code == 403:
                raise HTTPException(
                    status_code=HTTP_401_UNAUTHORIZED,
                    detail="Authentication required",
                    headers={"WWW-Authenticate": "Bearer"}
                )
            raise

security = CustomHTTPBearer()
security_optional = CustomHTTPBearer(auto_error=False)

# Alternative: Update get_current_user_optional
async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_optional)
) -> Optional[Dict[str, Any]]:
    """Get current user if authenticated, None if not"""
    if credentials is None:
        return None

    try:
        return await get_current_user(credentials)
    except HTTPException as e:
        # Convert 403 to 401 for consistency
        if e.status_code == 403:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required",
                headers={"WWW-Authenticate": "Bearer"}
            )
        raise

# Update documents endpoint to be more explicit
@app.get("/api/documents")
async def get_documents(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_optional)
):
    """Get user's documents (requires authentication)"""

    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={
                "WWW-Authenticate": "Bearer",
                "X-Requires-Auth": "true"
            }
        )

    current_user = await get_current_user(credentials)
    documents = await db.get_documents(current_user["id"])
    return documents
```

---

## Fix 3: Standardize Error Responses

```python
# Create error response models
from pydantic import BaseModel
from typing import Optional

class ErrorDetail(BaseModel):
    error: str
    detail: str
    requiresAuth: Optional[bool] = None
    code: Optional[str] = None

class ErrorResponse(BaseModel):
    detail: ErrorDetail

# Helper function for auth errors
def auth_error(message: str, detail: str = None):
    """Create standardized auth error"""
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail={
            "error": message,
            "detail": detail or message,
            "requiresAuth": True,
            "code": "AUTHENTICATION_REQUIRED"
        },
        headers={"WWW-Authenticate": "Bearer"}
    )

# Usage in endpoints
@app.get("/api/documents")
async def get_documents(current_user: Optional[Dict] = Depends(get_current_user_optional)):
    if not current_user:
        raise auth_error(
            "Authentication required",
            "Please log in to view your documents"
        )

    documents = await db.get_documents(current_user["id"])
    return documents

# Update get_current_user
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials

        if await is_token_blacklisted(token):
            raise auth_error(
                "Token has been revoked",
                "Please log in again"
            )

        # ... decode and validate ...

    except jwt.ExpiredSignatureError:
        raise auth_error(
            "Token has expired",
            "Please log in again"
        )
    except jwt.JWTError:
        raise auth_error(
            "Invalid token",
            "Authentication credentials are invalid"
        )
```

---

## Fix 4: Add Refresh Token Mechanism

```python
# Update token creation
from datetime import datetime, timedelta

ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7

def create_access_token(user_id: int) -> str:
    """Create short-lived access token"""
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {
        "sub": str(user_id),
        "type": "access",
        "exp": expire
    }
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: int) -> str:
    """Create long-lived refresh token"""
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode = {
        "sub": str(user_id),
        "type": "refresh",
        "exp": expire
    }
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

# Update login endpoint
@app.post("/api/auth/login")
async def login(user_data: UserLogin):
    # ... authenticate user ...

    access_token = create_access_token(user["id"])
    refresh_token = create_refresh_token(user["id"])

    return {
        "success": True,
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": user_response
    }

# Add refresh endpoint
@app.post("/api/auth/refresh")
async def refresh_token(refresh_token: str):
    """Get new access token using refresh token"""
    try:
        # Validate refresh token
        payload = jwt.decode(refresh_token, JWT_SECRET, algorithms=[JWT_ALGORITHM])

        # Check token type
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type"
            )

        # Check if blacklisted
        if await is_token_blacklisted(refresh_token):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token has been revoked"
            )

        user_id = int(payload.get("sub"))

        # Verify user still exists
        user = await db.get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )

        # Create new access token
        new_access_token = create_access_token(user_id)

        return {
            "success": True,
            "access_token": new_access_token,
            "token_type": "bearer",
            "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60
        }

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has expired. Please log in again."
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

# Update logout to invalidate both tokens
@app.post("/api/auth/logout")
async def logout(
    access_token: HTTPAuthorizationCredentials = Depends(security),
    refresh_token: Optional[str] = None
):
    """Logout and invalidate both access and refresh tokens"""
    try:
        # Blacklist access token
        token = access_token.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        exp = datetime.fromtimestamp(payload.get("exp"))
        await db.blacklist_token(token, exp)

        # Blacklist refresh token if provided
        if refresh_token:
            refresh_payload = jwt.decode(refresh_token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
            refresh_exp = datetime.fromtimestamp(refresh_payload.get("exp"))
            await db.blacklist_token(refresh_token, refresh_exp)

        return {
            "success": True,
            "message": "Logged out successfully"
        }

    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
```

---

## Fix 5: Add Rate Limiting

```python
# Install: pip install slowapi

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Initialize limiter
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Apply rate limiting to auth endpoints
@app.post("/api/auth/login")
@limiter.limit("5/minute")  # 5 attempts per minute per IP
async def login(request: Request, user_data: UserLogin):
    # ... login logic ...

@app.post("/api/auth/register")
@limiter.limit("3/hour")  # 3 registrations per hour per IP
async def register(request: Request, user_data: UserCreate):
    # ... registration logic ...

@app.post("/api/auth/refresh")
@limiter.limit("10/minute")  # 10 refresh attempts per minute
async def refresh_token(request: Request, refresh_token: str):
    # ... refresh logic ...
```

---

## Fix 6: Return 201 for Registration

```python
# Update registration endpoint
@app.post("/api/auth/register", status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    """Register a new user"""
    try:
        # ... registration logic ...

        return {
            "success": True,
            "token": access_token,
            "user": dict(UserResponse(**user)),
            "message": "Registration successful"
        }
    # ... error handling ...
```

---

## Testing the Fixes

After implementing the fixes, re-run the test suite:

```bash
python3 /home/ubuntu/contract1/omega-workflow/test_auth_flow.py
```

Expected improvements:
- Logout tests should pass (0% → 100%)
- Token invalidation tests should pass
- HTTP status code tests should pass (20% → 100%)
- Overall pass rate should improve (42% → 80%+)

---

## Docker Setup for Redis (if using Redis option)

```yaml
# Add to docker-compose.yml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes

  backend:
    depends_on:
      - redis
    environment:
      - REDIS_URL=redis://redis:6379

volumes:
  redis_data:
```

```python
# Update requirements.txt
redis==4.5.4
aioredis==2.0.1
```

---

## Summary of Changes

1. **Logout Endpoint** - Implement with token blacklist (Redis or DB)
2. **HTTP Status Codes** - Return 401 consistently, not 403
3. **Error Responses** - Standardize format with requiresAuth field
4. **Refresh Tokens** - Add for better security and UX
5. **Rate Limiting** - Prevent brute force attacks
6. **Registration Status** - Return 201 instead of 200

These changes will bring the authentication system from C+ to A- grade.
