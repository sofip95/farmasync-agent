

import asyncio
import os
from contextlib import asynccontextmanager
from dataclasses import dataclass
from typing import AsyncIterator, List, Optional, Dict, Any
from datetime import datetime

import mariadb
from pymongo import MongoClient
from pydantic import BaseModel, Field
from mcp.server.fastmcp import FastMCP, Context
import sys

sys.stdout.reconfigure(encoding='utf-8')

# --- 1. Modelos de Datos (Pydantic) para Salida Estructurada ---
# Reflejan la estructura de nuestras tablas de la base de datos.




class Producto(BaseModel):
    id: str
    nombre: str
    descripcion: str
    precio: float
    stock: int
    proveedorId: str

class Venta(BaseModel):
    id_venta: str
    id_vendedor: str
    id_cliente: str
    fecha_venta: datetime
    total: float

class DetalleVenta(BaseModel):
    id_detalle: str
    id_venta: str
    id_producto: str
    cantidad: int
    precio_unitario: float
    subtotal: float

class HistorialVentas(BaseModel):
    id_historial: str
    id_venta: str
    fecha_venta: datetime
    tipo_venta: str
    id_usuario: str
    observacion: str

# --- 2. Contexto y Ciclo de Vida del Servidor con MongoDB y MariaDB ---
# Esto gestiona las conexiones a las bases de datos.
@dataclass
class AppContext:
    mongo_client: MongoClient
    mariadb_conn: mariadb.Connection

@asynccontextmanager
async def app_lifespan(server: FastMCP) -> AsyncIterator[AppContext]:
    print("Conectando a MongoDB y MariaDB...")
    mongo_client = None
    mariadb_conn = None
    try:
        mongo_client = MongoClient('mongodb://localhost:27017/')
        print("Conexión a MongoDB creada.")
        
        mariadb_conn = mariadb.connect(
            host="localhost",
            user="root",
            password="55429387",
            database="farmasync_ventas",
        )
        print("Conexión a MariaDB creada.")
        
        yield AppContext(mongo_client=mongo_client, mariadb_conn=mariadb_conn)
    finally:
        if mongo_client:
            mongo_client.close()
            print("🔌 Conexión a MongoDB cerrada.")
        if mariadb_conn:
            mariadb_conn.close()
            print("🔌 Conexión a MariaDB cerrada.")

# --- 3. Creación del Servidor MCP ---
# Le pasamos el nuevo gestor de ciclo de vida.
mcp = FastMCP("BankTransactionServer", lifespan=app_lifespan)

# --- Herramientas para MongoDB (PRODUCTO) ---
@mcp.tool()
async def get_all_products(ctx: Context) -> List[Producto]:
    """
    Devuelve todos los productos.
    """
    mongo_client: MongoClient = ctx.request_context.lifespan_context.mongo_client
    db = mongo_client['farmasync_producto']
    collection = db['product']    
    products = list(collection.find({}))
    for p in products:
        p['id'] = str(p['_id'])
        del p['_id']
    return [Producto(**p) for p in products]

@mcp.tool()
async def get_product_by_name(product_name: str, ctx: Context) -> Optional[Producto]:
    """
    Busca y devuelve un producto específico por su nombre.
    """
    mongo_client: MongoClient = ctx.request_context.lifespan_context.mongo_client
    db = mongo_client['farmasync_producto']
    collection = db['product']
    product = collection.find_one({'nombre': product_name})
    if product:
        product['id'] = str(product['_id'])
        del product['_id']
        return Producto(**product)
    return None


# --- Herramientas para MariaDB (VENTA, DETALLE_VENTA, HISTORIAL_VENTAS) ---
@mcp.tool()
async def get_all_sales(ctx: Context) -> List[Dict[str, Any]]:
    """
    Devuelve todas las ventas.
    """
    mariadb_conn: mariadb.Connection = ctx.request_context.lifespan_context.mariadb_conn
    with mariadb_conn.cursor(dictionary=True) as cursor:
        cursor.execute("SELECT * FROM venta ORDER BY fecha_venta DESC")
        rows = cursor.fetchall()
        return rows

@mcp.tool()
async def get_sale_by_id(sale_id: str, ctx: Context) -> Optional[Dict[str, Any]]:
    """
    Busca y devuelve una venta específica por su ID.
    """
    mariadb_conn: mariadb.Connection = ctx.request_context.lifespan_context.mariadb_conn
    with mariadb_conn.cursor(dictionary=True) as cursor:
        cursor.execute("SELECT * FROM venta WHERE id_venta = %s", (sale_id,))
        row = cursor.fetchone()
        return row

@mcp.tool()
async def get_sale_details(sale_id: str, ctx: Context) -> List[Dict[str, Any]]:
    """
    Devuelve los detalles de una venta específica.
    """
    mariadb_conn: mariadb.Connection = ctx.request_context.lifespan_context.mariadb_conn
    with mariadb_conn.cursor(dictionary=True) as cursor:
        cursor.execute("SELECT * FROM detalle_venta WHERE id_venta = %s", (sale_id,))
        rows = cursor.fetchall()
        return rows

@mcp.tool()
async def get_sales_history(ctx: Context) -> List[Dict[str, Any]]:
    """
    Devuelve el historial de ventas.
    """
    mariadb_conn: mariadb.Connection = ctx.request_context.lifespan_context.mariadb_conn
    with mariadb_conn.cursor(dictionary=True) as cursor:
        cursor.execute("SELECT * FROM historial_ventas ORDER BY fecha_venta DESC")
        rows = cursor.fetchall()
        return rows


# --- 5. Ejecución del Servidor ---
if __name__ == "__main__":
    print(" Iniciando servidor MCP con conexiones a MongoDB y MariaDB...")
    mcp.run()
