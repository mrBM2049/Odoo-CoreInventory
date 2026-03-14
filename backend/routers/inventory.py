from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from database import get_db
from models import Inventory, StockLedger, Product, Operation
from schemas import InventoryResponse, InventoryUpdate, StockLedgerResponse, DashboardKPIs
from auth import verify_token

router = APIRouter(prefix="/api/v1", tags=["Inventory"])


@router.get("/inventory", response_model=List[InventoryResponse])
async def list_inventory(db: Session = Depends(get_db), user=Depends(verify_token)):
    return db.query(Inventory).order_by(Inventory.id).all()


@router.put("/inventory/{inventory_id}", response_model=InventoryResponse)
async def update_inventory(inventory_id: int, payload: InventoryUpdate, db: Session = Depends(get_db), user=Depends(verify_token)):
    inv = db.query(Inventory).filter(Inventory.id == inventory_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Inventory record not found")

    old_qty = inv.quantity
    inv.quantity = payload.quantity
    diff = payload.quantity - old_qty

    # Create a stock ledger entry for the manual adjustment
    ledger = StockLedger(
        product_id=inv.product_id,
        location_id=inv.location_id,
        operation_id=None,
        quantity_change=diff,
    )
    db.add(ledger)
    db.commit()
    db.refresh(inv)
    return inv


@router.get("/stock-ledger", response_model=List[StockLedgerResponse])
async def list_stock_ledger(db: Session = Depends(get_db), user=Depends(verify_token)):
    return db.query(StockLedger).order_by(StockLedger.id.desc()).all()


@router.get("/dashboard/kpis", response_model=DashboardKPIs)
async def get_dashboard_kpis(db: Session = Depends(get_db), user=Depends(verify_token)):
    total_products = db.query(Product).count()

    # Aggregate inventory per product
    from sqlalchemy import case
    inv_agg = db.query(
        Inventory.product_id,
        func.sum(Inventory.quantity).label("total_qty")
    ).group_by(Inventory.product_id).subquery()

    low_stock = db.query(func.count()).select_from(inv_agg).filter(
        inv_agg.c.total_qty > 0, inv_agg.c.total_qty <= 10
    ).scalar() or 0

    out_of_stock = db.query(func.count()).select_from(inv_agg).filter(
        inv_agg.c.total_qty <= 0
    ).scalar() or 0

    pending_receipts = db.query(Operation).filter(
        Operation.type == "receipt",
        Operation.status.in_(["draft", "ready", "waiting"])
    ).count()

    pending_deliveries = db.query(Operation).filter(
        Operation.type == "delivery",
        Operation.status.in_(["draft", "ready", "waiting"])
    ).count()

    total_receipts = db.query(Operation).filter(Operation.type == "receipt").count()
    total_deliveries = db.query(Operation).filter(Operation.type == "delivery").count()

    return DashboardKPIs(
        total_products=total_products,
        low_stock_items=low_stock,
        out_of_stock_items=out_of_stock,
        pending_receipts=pending_receipts,
        pending_deliveries=pending_deliveries,
        receipts_to_receive=pending_receipts,
        deliveries_to_deliver=pending_deliveries,
        late_receipts=0,
        late_deliveries=0,
        total_receipts=total_receipts,
        total_deliveries=total_deliveries,
    )
