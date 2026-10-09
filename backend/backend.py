import hashlib
import json
import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChainEvent(BaseModel):
    product_id: str
    stage: str
    location: str
    actor: str

class SupplyChain:
    def __init__(self):
        self.chain = []
        self.create_block(data={"message": "Genesis Block"}, previous_hash="0")

    def calculate_hash(self, block: dict) -> str:
        block_string = json.dumps(block, sort_keys=True).encode()
        return hashlib.sha256(block_string).hexdigest()

    def create_block(self, data: dict, previous_hash: str) -> dict:
        block = {
            "index": len(self.chain) + 1,
            "timestamp": time.time(),
            "data": data,
            "previous_hash": previous_hash,
        }
        block["hash"] = self.calculate_hash(block)
        self.chain.append(block)
        return block

    def get_last_block(self) -> dict:
        return self.chain[-1]

    def is_chain_valid(self) -> bool:
        for i in range(1, len(self.chain)):
            current = self.chain[i]
            previous = self.chain[i - 1]

            if current["previous_hash"] != previous["hash"]:
                return False

            temp_block = {k: v for k, v in current.items() if k != "hash"}
            if self.calculate_hash(temp_block) != current["hash"]:
                return False

        return True

ledger = SupplyChain()

@app.get("/chain")
def get_chain():
    return {"length": len(ledger.chain), "chain": ledger.chain}

@app.post("/add-stage")
def add_stage(event: ChainEvent):
    prev_block = ledger.get_last_block()
    new_block = ledger.create_block(
        data=event.model_dump(),
        previous_hash=prev_block["hash"]
    )
    return {"message": "Stage logged successfully!", "block": new_block}

@app.get("/verify")
def verify_chain():
    valid = ledger.is_chain_valid()
    return {"is_valid": valid, "status": "Secure" if valid else "Tampered!"}