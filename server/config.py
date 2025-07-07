from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

env_file = Path(__file__).cwd() / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=env_file, env_file_encoding="utf-8")

    # Client URL
    CLIENT_URL: str

    # Server URL
    SERVER_URL: str

    # Directory (tenant) ID
    TENANT_ID: str

    # Application (client) ID for Client
    CLIENT_ID: str

    # Application (client) ID for Server
    SERVER_ID: str


settings = Settings()
