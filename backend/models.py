from sqlalchemy import Column, Integer, Text, ForeignKey, DateTime, func, UniqueConstraint, String
from sqlalchemy.orm import relationship
from database import Base

# ─── Users ──────────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    full_name = Column(Text, nullable=False)
    email = Column(Text, nullable=False, unique=True)
    password = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now())


# ─── Categories ─────────────────────────────────────────────
class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(Text, nullable=False)
    description = Column(Text, nullable=True)

    products = relationship("Product", back_populates="category")


# ─── Products ───────────────────────────────────────────────
class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(Text, nullable=False)
    sku = Column(Text, unique=True, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    unit_of_measure = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    category = relationship("Category", back_populates="products")


# ─── Warehouses ─────────────────────────────────────────────
class Warehouse(Base):
    __tablename__ = "warehouses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(Text, nullable=False)
    address = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    locations = relationship("Location", back_populates="warehouse")


# ─── Locations ──────────────────────────────────────────────
class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False)
    name = Column(Text, nullable=False)
    description = Column(Text, nullable=True)

    warehouse = relationship("Warehouse", back_populates="locations")


# ─── Inventory ──────────────────────────────────────────────
class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    quantity = Column(Integer, default=0)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        UniqueConstraint("product_id", "location_id"),
    )

    product = relationship("Product")
    location = relationship("Location")


# ─── Operations ─────────────────────────────────────────────
class Operation(Base):
    __tablename__ = "operations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    type = Column(Text, nullable=False)
    status = Column(Text, default="DRAFT")
    created_at = Column(DateTime, server_default=func.now())

    items = relationship("OperationItem", back_populates="operation")


# ─── Operation Items ────────────────────────────────────────
class OperationItem(Base):
    __tablename__ = "operation_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    operation_id = Column(Integer, ForeignKey("operations.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    source_location_id = Column(Integer, ForeignKey("locations.id"), nullable=True)
    destination_location_id = Column(Integer, ForeignKey("locations.id"), nullable=True)
    quantity = Column(Integer, nullable=False)

    operation = relationship("Operation", back_populates="items")
    product = relationship("Product")
    source_location = relationship("Location", foreign_keys=[source_location_id])
    destination_location = relationship("Location", foreign_keys=[destination_location_id])


# ─── Stock Ledger ───────────────────────────────────────────
class StockLedger(Base):
    __tablename__ = "stock_ledger"

    id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=True)
    operation_id = Column(Integer, ForeignKey("operations.id"), nullable=True)
    quantity_change = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())

    product = relationship("Product")
    location = relationship("Location")
    operation = relationship("Operation")