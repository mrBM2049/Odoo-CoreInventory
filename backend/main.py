from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from database import engine, Base
from routers import products, warehouses, operations, inventory, auth

load_dotenv()

# Tables already exist in Supabase — no need to create_all
from database import DATABASE_URL

if DATABASE_URL.startswith("sqlite"):
    Base.metadata.create_all(bind=engine)

app = FastAPI(title="CoreInventory API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(warehouses.router)
app.include_router(operations.router)
app.include_router(inventory.router)


@app.get("/")
async def root():
    return {"message": "CoreInventory API is running"}


@app.get("/health")
async def health():
    return {"status": "ok"}
