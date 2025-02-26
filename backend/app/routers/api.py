from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(
    prefix="/api",
    tags=["api"],
    responses={404: {"description": "Not found"}},
)


# Sample data model
class Item(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    price: float
    is_offer: Optional[bool] = None


# Sample data
items = [
    {
        "id": 1,
        "name": "Item 1",
        "description": "Description 1",
        "price": 50.0,
        "is_offer": False,
    },
    {
        "id": 2,
        "name": "Item 2",
        "description": "Description 2",
        "price": 30.0,
        "is_offer": True,
    },
]


@router.get("/items", response_model=List[Item])
async def read_items():
    return items


@router.get("/items/{item_id}", response_model=Item)
async def read_item(item_id: int):
    for item in items:
        if item["id"] == item_id:
            return item
    raise HTTPException(status_code=404, detail="Item not found")


@router.post("/items", response_model=Item)
async def create_item(item: Item):
    items.append(item.dict())
    return item
