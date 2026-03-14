from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# ─── Auth ─── #
class UserCreate(BaseModel):
    full_name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: str
    full_name: str
    email: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── Categories ─── #
class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True


# ─── Products ─── #
class ProductCreate(BaseModel):
    name: str
    sku: str
    category_id: Optional[int] = None
    unit_of_measure: Optional[str] = None

class ProductResponse(BaseModel):
    id: int
    name: str
    sku: str
    category_id: Optional[int] = None
    unit_of_measure: Optional[str] = None
    created_at: Optional[datetime] = None
    category: Optional[CategoryResponse] = None

    class Config:
        from_attributes = True


# ─── Warehouses ─── #
class WarehouseCreate(BaseModel):
    name: str
    address: Optional[str] = None

class WarehouseResponse(BaseModel):
    id: int
    name: str
    address: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── Locations ─── #
class LocationCreate(BaseModel):
    warehouse_id: int
    name: str
    description: Optional[str] = None

class LocationResponse(BaseModel):
    id: int
    warehouse_id: int
    name: str
    description: Optional[str] = None
    warehouse: Optional[WarehouseResponse] = None

    class Config:
        from_attributes = True


# ─── Inventory ─── #
class InventoryResponse(BaseModel):
    id: int
    product_id: int
    location_id: int
    quantity: int
    updated_at: Optional[datetime] = None
    product: Optional[ProductResponse] = None
    location: Optional[LocationResponse] = None

    class Config:
        from_attributes = True

class InventoryUpdate(BaseModel):
    quantity: int


# ─── Operations ─── #
class OperationItemCreate(BaseModel):
    product_id: int
    source_location_id: Optional[int] = None
    destination_location_id: Optional[int] = None
    quantity: int

class OperationItemResponse(BaseModel):
    id: int
    operation_id: int
    product_id: int
    source_location_id: Optional[int] = None
    destination_location_id: Optional[int] = None
    quantity: int
    product: Optional[ProductResponse] = None

    class Config:
        from_attributes = True

class OperationCreate(BaseModel):
    type: str  # receipt, delivery, transfer, adjustment
    items: List[OperationItemCreate]

class OperationResponse(BaseModel):
    id: int
    type: str
    status: str
    created_at: Optional[datetime] = None
    items: List[OperationItemResponse] = []

    class Config:
        from_attributes = True


# ─── Stock Ledger ─── #
class StockLedgerResponse(BaseModel):
    id: int
    product_id: int
    location_id: Optional[int] = None
    operation_id: Optional[int] = None
    quantity_change: int
    created_at: Optional[datetime] = None
    product: Optional[ProductResponse] = None
    location: Optional[LocationResponse] = None

    class Config:
        from_attributes = True


# ─── Dashboard ─── #
class DashboardKPIs(BaseModel):
    total_products: int
    low_stock_items: int
    out_of_stock_items: int
    pending_receipts: int
    pending_deliveries: int
    receipts_to_receive: int
    deliveries_to_deliver: int
    late_receipts: int
    late_deliveries: int
    total_receipts: int
    total_deliveries: int
