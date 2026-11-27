from datetime import datetime

from pydantic import BaseModel, Field, HttpUrl, field_validator


class NoteCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200, examples=["LangChain 入門"])
    content: str = Field(..., min_length=1, max_length=20000, examples=["LangChain 是建構 LLM 應用的框架。"])


class NoteUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    content: str | None = Field(default=None, min_length=1, max_length=20000)


class NoteRead(BaseModel):
    id: int
    title: str
    content: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class AskRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=2000, examples=["LangChain 可以做什麼？"])
    top_k: int = Field(default=3, ge=1, le=10)


class AskResponse(BaseModel):
    question: str
    answer: str
    provider: str
    sources: list[NoteRead]


class WebhookCreate(BaseModel):
    url: HttpUrl = Field(..., max_length=2048)
    event_types: str = Field(default="*", min_length=1, max_length=500, examples=["note.created,ask.completed"])
    secret: str | None = Field(default=None, max_length=256)

    @field_validator("secret")
    @classmethod
    def reject_placeholder_secret(cls, value: str | None) -> str | None:
        if value is not None and value.strip().lower() == "change-me-in-production":
            raise ValueError("secret must not be 'change-me-in-production'")
        return value


class WebhookRead(BaseModel):
    id: int
    url: str
    event_types: str
    created_at: datetime

    model_config = {"from_attributes": True}


class EventRead(BaseModel):
    id: int
    event_type: str
    payload: str
    created_at: datetime

    model_config = {"from_attributes": True}


class HealthResponse(BaseModel):
    status: str
    app_name: str
    llm_provider: str
    docs_url: str
    storage: str = Field(description="sqlite or postgres")
    persistent_data: bool = Field(description="True when using Supabase/Postgres")
    llm_ready: bool = Field(default=True, description="False when Ollama is configured but unreachable")
    ollama_model: str | None = None
    ollama_base_url: str | None = None
    dify_configured: bool = Field(default=False, description="True when DIFY_API_KEY is set")


class DifyAskRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=2000)
    user: str = Field(default="tutorial-user", min_length=1, max_length=128)


class DifyAskResponse(BaseModel):
    question: str
    answer: str
    provider: str = "dify"
    raw: dict | None = None
