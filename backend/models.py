from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from database import Base


class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(Text, nullable=False)
    description = Column(Text, nullable=True)


class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(Text, nullable=False)
    sku = Column(Text, unique=True, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    unit_of_measure = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    category = relationship("Category", lazy="joined")


class Warehouse(Base):
    __tablename__ = "warehouses"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(Text, nullable=False)
    address = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    locations = relationship("Location", back_populates="warehouse", lazy="joined")


class Location(Base):
    __tablename__ = "locations"
    id = Column(Integer, primary_key=True, autoincrement=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False)
    name = Column(Text, nullable=False)
    description = Column(Text, nullable=True)

    warehouse = relationship("Warehouse", back_populates="locations")


class Inventory(Base):
    __tablename__ = "inventory"
    id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    quantity = Column(Integer, default=0)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    product = relationship("Product", lazy="joined")
    location = relationship("Location", lazy="joined")


class Operation(Base):
    __tablename__ = "operations"
    id = Column(Integer, primary_key=True, autoincrement=True)
    type = Column(Text, nullable=False)  # receipt, delivery, transfer, adjustment
    status = Column(Text, default="draft")  # draft, waiting, ready, done, cancelled
    created_at = Column(DateTime, server_default=func.now())

    items = relationship("OperationItem", back_populates="operation", lazy="joined")


class OperationItem(Base):
    __tablename__ = "operation_items"
    id = Column(Integer, primary_key=True, autoincrement=True)
    operation_id = Column(Integer, ForeignKey("operations.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    source_location_id = Column(Integer, ForeignKey("locations.id"), nullable=True)
    destination_location_id = Column(Integer, ForeignKey("locations.id"), nullable=True)
    quantity = Column(Integer, default=0)

    operation = relationship("Operation", back_populates="items")
    product = relationship("Product", lazy="joined")
    source_location = relationship("Location", foreign_keys=[source_location_id], lazy="joined")
    destination_location = relationship("Location", foreign_keys=[destination_location_id], lazy="joined")


class StockLedger(Base):
    __tablename__ = "stock_ledger"
    id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=True)
    operation_id = Column(Integer, ForeignKey("operations.id"), nullable=True)
    quantity_change = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())

    product = relationship("Product", lazy="joined")
    location = relationship("Location", lazy="joined")
    operation = relationship("Operation", lazy="joined")
