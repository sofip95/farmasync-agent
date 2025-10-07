import asyncio
import sys
import os

from dotenv import load_dotenv
load_dotenv()

from mirascope import llm, BaseTool
from pydantic import Field
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

# --- 1. Definición de Herramientas
class GetAllProducts(BaseTool):
    """ Útiliza esta herramienta para saber cuáles productos hay en el catálogo de la farmacia."""
    def call(self) -> str:
        return "Herramienta 'GetAllProducts' seleccionada."

class GetProductByName(BaseTool):
    """Busca y devuelve un producto específico por su nombre."""
    product_name: str = Field(..., description="El nombre del producto a consultar.")
    def call(self) -> str:
        return f"Herramienta 'GetProductByName' seleccionada para el producto {self.product_name}."

class GetAllSales(BaseTool):
    """Devuelve todas las ventas registradas."""
    def call(self) -> str:
        return "Herramienta 'GetAllSales' seleccionada."

class GetSaleById(BaseTool):
    """Busca y devuelve una venta específica por su ID."""
    sale_id: str = Field(..., description="El ID de la venta a consultar.")
    def call(self) -> str:
        return f"Herramienta 'GetSaleById' seleccionada para la venta {self.sale_id}."

class GetSaleDetails(BaseTool):
    """Devuelve los detalles de una venta específica."""
    sale_id: str = Field(..., description="El ID de la venta para obtener detalles.")
    def call(self) -> str:
        return f"Herramienta 'GetSaleDetails' seleccionada para la venta {self.sale_id}."

class GetSalesHistory(BaseTool):
    """Devuelve el historial de ventas."""
    def call(self) -> str:
        return "Herramienta 'GetSalesHistory' seleccionada."


# --- 2. Mapeo de Herramientas ---
# Ahora mapeamos desde el nombre (string) que nos da Gemini al nombre en el servidor.
TOOL_NAME_MAP = {
    "GetAllProducts": "get_all_products",
    "GetProductByName": "get_product_by_name",
    "GetAllSales": "get_all_sales",
    "GetSaleById": "get_sale_by_id",
    "GetSaleDetails": "get_sale_details",
    "GetSalesHistory": "get_sales_history",
}

# --- 3. Función de llamada al LLM
@llm.call(
    "google",
    model="gemini-2.5-pro",
    tools=[
        GetAllProducts,
        GetProductByName,
        GetAllSales,
        GetSaleById,
        GetSaleDetails,
        GetSalesHistory,
    ],
)
def get_user_intent(query: str):
    """
    ¡Eres un asistente de una farmacia!
    1.  Analiza la petición del usuario.
    2.  Si la petición del usuario se relaciona con obtener información de productos o ventas, llama a la herramienta correspondiente:
        - Para ver todos los productos: GetAllProducts
        - Para buscar un producto por nombre: GetProductByName
        - Para ver todas las ventas: GetAllSales
        - Para buscar una venta por ID: GetSaleById
        - Para ver detalles de una venta: GetSaleDetails
        - Para ver historial de ventas: GetSalesHistory
    3.  Si la petición NO se relaciona con productos o ventas (por ejemplo, si te preguntan por canciones, el clima, o te saludan), tu ÚNICA respuesta debe ser:
        "Lo siento, no puedo procesar esa solicitud. Mi única función es ayudarte a obtener información relacionada con la farmacia."
    No intentes tener una conversación. No ofrezcas información que no provenga directamente de una herramienta. Tu propósito es únicamente seleccionar una herramienta o dar la respuesta de error predefinida.
    """
    return query

# --- 4. Lógica Principal del Cliente (CORRECCIÓN FINAL) ---
async def main(prompt):
    server_params = StdioServerParameters(command=sys.executable, args=["server_mcp.py"])

    print("Cliente Farmacia MCP (usando Gemini) iniciado. Escribe 'salir' para terminar.")
    print("Ejemplos: 'cuáles productos hay?'")

    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
                await session.initialize()
                try:
                    response = get_user_intent(prompt)
                    
                    if tool := response.tool:
                        # CORRECCIÓN: Extraemos el nombre y los argumentos de la sub-estructura 'tool_call'
                        tool_call_info = tool.tool_call
                        tool_name = tool_call_info.name
                        tool_args = tool_call_info.args

                        # Obtenemos el nombre real de la herramienta en el servidor usando el nuevo mapa
                        tool_name_on_server = TOOL_NAME_MAP.get(tool_name)
                        
                        if not tool_name_on_server:
                             print(f"😕 Error: El LLM devolvió una herramienta desconocida: {tool_name}")
                             

                        print(f"🧠 LLM decidió llamar a la herramienta '{tool_name_on_server}' con argumentos: {tool_args}")
                        
                        result = await session.call_tool(tool_name_on_server, arguments=tool_args)

                        if result.isError:
                            print(f"Error del servidor: {result.content}")
                        elif result.structuredContent:
                            print("Respuesta del servidor:")
                            return result.structuredContent
                        else:
                            print(f"Respuesta (sin formato estructurado): {result.content}")
                    else:
                        return  response.content
                except Exception as e:
                    print(f"Ha ocurrido un error inesperado: {e}")

    print("\n Cliente desconectado. ¡Adiós!")