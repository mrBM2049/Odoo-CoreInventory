from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Product, Category
from schemas import ProductCreate, ProductResponse, CategoryCreate, CategoryResponse
from auth import verify_token

router = APIRouter(prefix="/api/v1", tags=["Products"])


@router.get("/products", response_model=List[ProductResponse])
async def list_products(db: Session = Depends(get_db), user=Depends(verify_token)):
    return db.query(Product).order_by(Product.id).all()


@router.post("/products", response_model=ProductResponse)
async def create_product(payload: ProductCreate, db: Session = Depends(get_db), user=Depends(verify_token)):
    existing = db.query(Product).filter(Product.sku == payload.sku).first()
    if existing:
        raise HTTPException(status_code=400, detail="SKU already exists")
    product = Product(**payload.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.get("/products/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int, db: Session = Depends(get_db), user=Depends(verify_token)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.put("/products/{product_id}", response_model=ProductResponse)
async def update_product(product_id: int, payload: ProductCreate, db: Session = Depends(get_db), user=Depends(verify_token)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    for key, val in payload.model_dump().items():
        setattr(product, key, val)
    db.commit()
    db.refresh(product)
    return product


@router.delete("/products/{product_id}")
async def delete_product(product_id: int, db: Session = Depends(get_db), user=Depends(verify_token)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()
    return {"ok": True}


# ─── Categories ─── #
@router.get("/categories", response_model=List[CategoryResponse])
async def list_categories(db: Session = Depends(get_db), user=Depends(verify_token)):
    return db.query(Category).order_by(Category.id).all()


@router.post("/categories", response_model=CategoryResponse)
async def create_category(payload: CategoryCreate, db: Session = Depends(get_db), user=Depends(verify_token)):
    cat = Category(**payload.model_dump())
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat
