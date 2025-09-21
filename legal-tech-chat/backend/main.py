import json

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from langchain_core.messages import HumanMessage, ToolMessage, AIMessage, AIMessageChunk
from backend.agent_manager import AgentManager


load_dotenv()

agent_manager = AgentManager()

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],  # Allow all origins
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)


@app.get("/")
async def root():
    return {"status": "OK"}


class RunPayload(BaseModel):
    model: str
    prompt: str
    history: str

def rebuild_history(history):
    history = json.loads(history)

    type_to_class = {
        "human": HumanMessage,
        "tool": ToolMessage,
        "ai": AIMessage
    }

    messages = []
    for item_json_str in history:
        item = json.loads(item_json_str)
        item_class = type_to_class.get(item["type"])
        if item_class:
            # use pydantic BaseClass method to rebuild message model from json string dumped by model_dump_json
            messages.append(item_class.model_validate_json(item_json_str))

    return messages


async def runner(model: str, prompt: str, history: str):
    # history comes in from FE as stringified list of dumped model messages
    if history != "[]":
        previous_messages = rebuild_history(history)
    else:
        previous_messages = []

    prompt_message = HumanMessage(content=prompt)
    input_messages = [*previous_messages, prompt_message]
    messages = agent_manager.get_model_by_name(model).astream(
        input={"messages": input_messages}, stream_mode=["messages", "updates"]
    )

    # for demo purposes only:
    # - we are passing inmemory context as history around because we don't want to handle a db in this demo
    # - "updates" stream_mode returns AIMessage instead of AIMessageChunk which is less data to pass around than chunk models
    # - context is passed to FE and back on each /run/ endpoint call so AI is aware of the previous messages
    # - we are not storing context on server in order we don't kill all of it's memory - in production you would store it in a db
    context = json.loads(history)
    context.append(prompt_message.model_dump_json())

    async for message in messages:
        if message[0] == "messages":
            chunk = message[1]

            # output tool call section type
            if hasattr(chunk[0], "tool_calls") and len(chunk[0].tool_calls) > 0:
                for tool in chunk[0].tool_calls:
                    if tool.get('name'):
                        tool_calls_content = json.dumps(tool)
                        yield f"data: {json.dumps({'content': tool_calls_content, 'type': 'tool_call'})}\n\n"

            if isinstance(chunk[0], ToolMessage):
                yield f"data: {json.dumps({'content': chunk[0].content, 'type': 'tool_message'})}\n\n"
            if isinstance(chunk[0], AIMessageChunk):
                yield f"data: {json.dumps({'content': chunk[0].content, 'type': 'ai_message'})}\n\n"
            if isinstance(chunk[0], HumanMessage):
                yield f"data: {json.dumps({'content': chunk[0].content, 'type': 'user_message'})}\n\n"

        if message[0] == "updates":
            # use pydantic BaseClass method model_dump_json to dump message model to be stringified into history
            if "assistant" in message[1]:
                for history_message in message[1]["assistant"]["messages"]:
                    context.append(history_message.model_dump_json())
            elif "tools" in message[1]:
                for tool_message in message[1]["tools"]["messages"]:
                    context.append(tool_message.model_dump_json())

    yield f"data: {json.dumps({'content': context, 'type': 'history'})}\n\n"
    yield f"data: {json.dumps({'content': '', 'type': 'end'})}\n\n"


@app.post("/run/")
async def run(payload: RunPayload):
    return StreamingResponse(
        runner(model=payload.model, prompt=payload.prompt, history=payload.history),
        media_type="text/event-stream",
    )
