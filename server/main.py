from contextlib import asynccontextmanager
from typing import Any

import httpx
from config import settings
from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt

jwks = {}


async def get_jwks():
    global jwks

    if not jwks:
        async with httpx.AsyncClient() as client:
            openid = await client.get(
                f"https://login.microsoftonline.com/{settings.TENANT_ID}/v2.0/.well-known/openid-configuration"
            )
            jwks_uri = openid.json()["jwks_uri"]
            jwks_resp = await client.get(jwks_uri)
            jwks = jwks_resp.json()


async def verify_token(request: Request):
    global jwks

    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")

    token = auth_header[len("Bearer ") :]

    try:
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header["kid"]

        key = next((k for k in jwks["keys"] if k["kid"] == kid), None)

        payload = jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            audience=settings.SERVER_ID,
            issuer=f"https://login.microsoftonline.com/{settings.TENANT_ID}/v2.0",
        )
        return payload
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Token validation error: {str(e)}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    await get_jwks()
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.CLIENT_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/user-info")
async def get_user_info(user: dict[str, Any] = Depends(verify_token)):
    return {
        "name": user.get("name"),
        "email": user.get("preferred_username"),
        "user_id": user.get("oid"),
    }
