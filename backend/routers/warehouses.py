from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Warehouse, Location
from schemas import WarehouseCreate, WarehouseResponse, LocationCreate, LocationResponse
from auth import verify_token

router = APIRouter(prefix="/api/v1", tags=["Warehouses"])


# ─── Warehouses ─── #
@router.get("/warehouses", response_model=List[WarehouseResponse])
async def list_warehouses(db: Session = Depends(get_db), user=Depends(verify_token)):
    return db.query(Warehouse).order_by(Warehouse.id).all()


@router.post("/warehouses", response_model=WarehouseResponse)
async def create_warehouse(payload: WarehouseCreate, db: Session = Depends(get_db), user=Depends(verify_token)):
    wh = Warehouse(**payload.model_dump())
    db.add(wh)
    db.commit()
    db.refresh(wh)
    return wh


@router.delete("/warehouses/{warehouse_id}")
async def delete_warehouse(warehouse_id: int, db: Session = Depends(get_db), user=Depends(verify_token)):
    wh = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
    if not wh:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    db.delete(wh)
    db.commit()
    return {"ok": True}


# ─── Locations ─── #
@router.get("/locations", response_model=List[LocationResponse])
async def list_locations(db: Session = Depends(get_db), user=Depends(verify_token)):
    return db.query(Location).order_by(Location.id).all()


@router.get("/locations/by-warehouse/{warehouse_id}", response_model=List[LocationResponse])
async def locations_by_warehouse(warehouse_id: int, db: Session = Depends(get_db), user=Depends(verify_token)):
    return db.query(Location).filter(Location.warehouse_id == warehouse_id).order_by(Location.id).all()


@router.post("/locations", response_model=LocationResponse)
async def create_location(payload: LocationCreate, db: Session = Depends(get_db), user=Depends(verify_token)):
    loc = Location(**payload.model_dump())
    db.add(loc)
    db.commit()
    db.refresh(loc)
    return loc


@router.delete("/locations/{location_id}")
async def delete_location(location_id: int, db: Session = Depends(get_db), user=Depends(verify_token)):
    loc = db.query(Location).filter(Location.id == location_id).first()
    if not loc:
        raise HTTPException(status_code=404, detail="Location not found")
    db.delete(loc)
    db.commit()
    return {"ok": True}
