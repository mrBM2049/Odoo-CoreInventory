from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Operation, OperationItem, Inventory, StockLedger
from schemas import OperationCreate, OperationResponse
from auth import verify_token

router = APIRouter(prefix="/api/v1", tags=["Operations"])


@router.get("/operations", response_model=List[OperationResponse])
async def list_operations(type: str = None, status: str = None, db: Session = Depends(get_db), user=Depends(verify_token)):
    q = db.query(Operation)
    if type:
        q = q.filter(Operation.type == type)
    if status:
        q = q.filter(Operation.status == status)
    return q.order_by(Operation.id.desc()).all()


@router.get("/operations/{operation_id}", response_model=OperationResponse)
async def get_operation(operation_id: int, db: Session = Depends(get_db), user=Depends(verify_token)):
    op = db.query(Operation).filter(Operation.id == operation_id).first()
    if not op:
        raise HTTPException(status_code=404, detail="Operation not found")
    return op


@router.post("/operations", response_model=OperationResponse)
async def create_operation(payload: OperationCreate, db: Session = Depends(get_db), user=Depends(verify_token)):
    op = Operation(type=payload.type, status="draft")
    db.add(op)
    db.flush()

    for item_data in payload.items:
        item = OperationItem(
            operation_id=op.id,
            product_id=item_data.product_id,
            source_location_id=item_data.source_location_id,
            destination_location_id=item_data.destination_location_id,
            quantity=item_data.quantity,
        )
        db.add(item)

    db.commit()
    db.refresh(op)
    return op


@router.post("/operations/{operation_id}/validate", response_model=OperationResponse)
async def validate_operation(operation_id: int, db: Session = Depends(get_db), user=Depends(verify_token)):
    op = db.query(Operation).filter(Operation.id == operation_id).first()
    if not op:
        raise HTTPException(status_code=404, detail="Operation not found")
    if op.status == "done":
        raise HTTPException(status_code=400, detail="Operation already validated")
    if op.status == "cancelled":
        raise HTTPException(status_code=400, detail="Cannot validate cancelled operation")

    for item in op.items:
        if op.type == "receipt":
            # Add stock to destination location
            inv = db.query(Inventory).filter(
                Inventory.product_id == item.product_id,
                Inventory.location_id == item.destination_location_id,
            ).first()
            if inv:
                inv.quantity += item.quantity
            else:
                inv = Inventory(
                    product_id=item.product_id,
                    location_id=item.destination_location_id,
                    quantity=item.quantity,
                )
                db.add(inv)

            # Ledger entry
            db.add(StockLedger(
                product_id=item.product_id,
                location_id=item.destination_location_id,
                operation_id=op.id,
                quantity_change=item.quantity,
            ))

        elif op.type == "delivery":
            # Remove stock from source location
            inv = db.query(Inventory).filter(
                Inventory.product_id == item.product_id,
                Inventory.location_id == item.source_location_id,
            ).first()
            if not inv or inv.quantity < item.quantity:
                raise HTTPException(
                    status_code=400,
                    detail=f"Insufficient stock for product {item.product_id}"
                )
            inv.quantity -= item.quantity

            # Ledger entry
            db.add(StockLedger(
                product_id=item.product_id,
                location_id=item.source_location_id,
                operation_id=op.id,
                quantity_change=-item.quantity,
            ))

        elif op.type == "transfer":
            # Remove from source
            src_inv = db.query(Inventory).filter(
                Inventory.product_id == item.product_id,
                Inventory.location_id == item.source_location_id,
            ).first()
            if not src_inv or src_inv.quantity < item.quantity:
                raise HTTPException(
                    status_code=400,
                    detail=f"Insufficient stock for transfer of product {item.product_id}"
                )
            src_inv.quantity -= item.quantity

            # Add to destination
            dst_inv = db.query(Inventory).filter(
                Inventory.product_id == item.product_id,
                Inventory.location_id == item.destination_location_id,
            ).first()
            if dst_inv:
                dst_inv.quantity += item.quantity
            else:
                dst_inv = Inventory(
                    product_id=item.product_id,
                    location_id=item.destination_location_id,
                    quantity=item.quantity,
                )
                db.add(dst_inv)

            # Ledger entries
            db.add(StockLedger(
                product_id=item.product_id,
                location_id=item.source_location_id,
                operation_id=op.id,
                quantity_change=-item.quantity,
            ))
            db.add(StockLedger(
                product_id=item.product_id,
                location_id=item.destination_location_id,
                operation_id=op.id,
                quantity_change=item.quantity,
            ))

        elif op.type == "adjustment":
            inv = db.query(Inventory).filter(
                Inventory.product_id == item.product_id,
                Inventory.location_id == (item.destination_location_id or item.source_location_id),
            ).first()
            loc_id = item.destination_location_id or item.source_location_id
            if inv:
                diff = item.quantity - inv.quantity
                inv.quantity = item.quantity
            else:
                diff = item.quantity
                inv = Inventory(
                    product_id=item.product_id,
                    location_id=loc_id,
                    quantity=item.quantity,
                )
                db.add(inv)

            db.add(StockLedger(
                product_id=item.product_id,
                location_id=loc_id,
                operation_id=op.id,
                quantity_change=diff,
            ))

    op.status = "done"
    db.commit()
    db.refresh(op)
    return op


@router.post("/operations/{operation_id}/cancel", response_model=OperationResponse)
async def cancel_operation(operation_id: int, db: Session = Depends(get_db), user=Depends(verify_token)):
    op = db.query(Operation).filter(Operation.id == operation_id).first()
    if not op:
        raise HTTPException(status_code=404, detail="Operation not found")
    if op.status == "done":
        raise HTTPException(status_code=400, detail="Cannot cancel a completed operation")
    op.status = "cancelled"
    db.commit()
    db.refresh(op)
    return op


@router.post("/operations/{operation_id}/ready", response_model=OperationResponse)
async def mark_ready(operation_id: int, db: Session = Depends(get_db), user=Depends(verify_token)):
    op = db.query(Operation).filter(Operation.id == operation_id).first()
    if not op:
        raise HTTPException(status_code=404, detail="Operation not found")
    op.status = "ready"
    db.commit()
    db.refresh(op)
    return op
